'use strict';
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const shortid = require('shortid');
const aws = require('aws-sdk');

const { app, runServer, closeServer } = require('../app');
const { Song, Set, User } = require('../models');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config/constants');

const expect = chai.expect;

chai.use(chaiHttp);

// ---- helper functions -----
function date (date) {
  return new Date(date).toISOString();
}

// ---- generate users -----
let newUsers = []; // non-hashed pw
let dbUsers = []; // contains hashed pw

function generateUserSignup () {
  return { 
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }
}

function seedUserData () {
  let users = [];
  for ( let i = 0; i < 2; i++) {
    users.push(generateUserSignup())
  };
  newUsers = users;
  const pwPromises = users.map(user => {
    return User.hashPassword(user.password);
  })
  return Promise.all(pwPromises)
  .then(passwords => {
    const hashedUsers = users.map((user, index) => {
      user = Object.assign({}, user)
      user.password = passwords[index];
      return user;
    })
    return User.insertMany(hashedUsers)
  })
}

// ----- generate song comments ------
function generateComments (userId) {
  return {
    addedBy: userId,
    dateAdded: Date.now(),
    comment: 'This is a comment string'
  }
}

function seedComments (userId) {
  let comments = [];
  for ( let i = 0; i < 2; i++ ) {
    comments.push(generateComments(userId))
  }
  return comments;
}

// ----- generate files array ------
function generateFiles () {
  let instruments = ['vocals1', 'vocals2', 'vocals3', 'acGuitar', 'bass',
  'eg1', 'eg2', 'keys', 'pad', 'drumsOverhead', 'drumSnare', 'drumKick', 'drumTom1', 'drumTom2', 'drumTom3'];
  let uniqueId = shortid.generate();
  let filesArray = []
  for ( let i = 0; i < instruments.length; i++ ){
    filesArray.push(
      {
        src: `2018-07-23-${instruments[i]}-${uniqueId}.wav`,
        name: instruments[i]
      }
    )
  }
  return filesArray;
}

// ----- generate band members -----
function generateBandMembers () {
  let instruments = ['Vocals1', 'Vocals2', 'Vocals3', 'AcGuitar', 'Bass', 'Eg1', 'Eg2', 'Keys', 'Pad', 'Drum'];
  let bandMemArray = [];
  for (let i = 0; i < instruments.length; i++ ) {
    bandMemArray.push(
      {
        instrument: instruments[i],
        name: faker.name.findName()
      }
    )
  }
  return bandMemArray;
}

// ----- generate a set -----
function generateSet (userId) {
  let commentsArray = seedComments(userId);
  return { 
    dateAdded: Date.now(),
    eventDate: Date.now(),
    eventType: 'SWS',
    mainLead: 'Lee Yang',
    mainSpeaker: 'Peter Choi',
    bandMembers: generateBandMembers(),
    files: generateFiles(),
    comments: commentsArray
  }
}

function generateSetInputted (userId) {
  return {
    eventDate: Date.now(),
    eventType: 'SWS',
    mainLead: 'John Sung',
    mainSpeaker: 'Peter Choi',
    memVocals1: 'Member 1',
    memVocals2: 'Member 2',
    memVocals3: 'Member 3',
    memAcGuitar: 'Guitar Player',
    memBass: 'Bass Player',
    memEg1: 'EG Player',
    memEg2: 'EG Player',
    memKeys: 'Keyboardist',
    memPad: 'Pad Master',
    memDrum: 'Drummer',
  }
}

function seedSetData (users) {
  let sets = [];
  for ( let i = 0; i < users.length; i++) {
    sets.push(generateSet(users[i]._id));
  }
  return Set.insertMany(sets);
};

// ---- drop the database -----
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('SETS EP', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });
  
  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    console.log('Seeding User Data and seeding songs');
    return seedUserData()
    .then(users => {
      dbUsers = users;
    });
  });
  
  afterEach(function () {
    return tearDownDb();
  });

  describe('/api/sets', function() {
    
    // ----- code that runs before each of the blocks below ------
    beforeEach(function(){
      return seedSetData(dbUsers)
    });

    // ----- agent for auth requests -----
    let agent = chai.request.agent(app);

    beforeEach(function() {
      return agent
      .post('/auth/login')
      .send({ username: newUsers[0].username, password: newUsers[0].password })
    });


    describe('GET /api/sets', function() {
      it('should get list of sets', function() {
        let res;
        return chai.request(app)
        .get('/api/sets')
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          return Set.count()
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        })
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }
        })
      })

      it('should get list of sets with the right fields', function () {
        let res;
        let resSong;

        return chai.request(app)
        .get('/api/sets')
        .then(_res => {
          res = _res;
          resSong = _res.body[0];
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          res.body.forEach(song => {
            expect(song).to.be.a('object');
            expect(song).to.include.keys(
              'dateAdded', 'bandMembers', 'files', '_id', 'eventDate', 'eventType',
              'mainLead', 'mainSpeaker', 'comments'
            )
          })
          return Set.findById({ _id: resSong._id})
        })
        .then(song => {
          let dbSong = song.toObject();
          expect(date(dbSong.dateAdded)).to.equal(date(resSong.dateAdded));
          expect(dbSong.eventType).to.equal(resSong.eventType);
          expect(dbSong.mainLead).to.equal(dbSong.mainLead);
          expect(dbSong.mainSpeaker).to.equal(resSong.mainSpeaker);
          expect(dbSong.bandMembers).to.deep.equal(resSong.bandMembers);
          expect(dbSong.files).to.deep.equal(resSong.files);
          for (let i = 0; i < dbSong.comments; i++) {
            expect(dbSong.comments[i].comment).to.equal(resSong.comments[i].comment);
          }
        })
      })

    });

    // describe('POST a new set ', function() {
    //   it('should add set with the right fields', function() {
    //     let inputtedSet = generateSetInputted(dbUsers[0]._id);
    //     let resSet;

    //     return agent
    //     .post('/api/sets')
    //     .send(inputtedSet)
    //     .then(_res => {
    //       resSet = _res.body;
    //       expect(date(resSet.eventDate)).to.equal(date(inputtedSet.eventDate))
    //       expect(resSet.eventType).to.equal(inputtedSet.eventType);
    //       expect(resSet.mainLead).to.equal(inputtedSet.mainLead);
    //       expect(resSet.mainSpeaker).to.equal(inputtedSet.mainSpeaker);
    //       return Set.findById(resSet._id)
    //     })
    //     .then(set => {
    //       expect(date(set.dateAdded)).to.equal(date(resSet.dateAdded));
    //       expect(set._id.toString()).to.equal(resSet._id);
    //       expect(set.bandMembers).to.deep.equal(resSet.bandMembers);
    //       expect(set.eventType).to.equal(resSet.eventType);
    //       expect(set.mainLead).to.equal(resSet.mainLead);
    //       expect(set.mainSpeaker).to.equal(resSet.mainSpeaker);
    //     })
    //   });

    //   it('should not add a set if a field is missing', function() {
    //     let setMissingField = {
    //       evenDate: Date.now(),
    //       eventType: 'SWS',
    //       mainLea: 'this key is misspelled'
    //     }

    //     return agent
    //     .post('/api/sets')
    //     .send(setMissingField)
    //     .then(_res => {
    //       if (_res.ok) {
    //         expect.fail(null, null, 'should not have added song with missing artist field')
    //       }
    //       else {
    //         expect(_res).to.have.status(422);
    //         expect(_res.body).to.be.a('object');
    //         expect(_res.body.message).to.be.equal('Missing field');
    //         expect(_res.body.reason).to.be.equal('ValidationError');
    //       }
    //     })
    //   })

    //   it('should add set and upload files to Amazon S3', function() {
    //     let mockData = generateSetInputted(dbUsers[0]._id);
    //     this.timeout(15000);
    //     let resSet;

    //     return agent
    //     .post('/api/sets')
    //     .attach('vocals1', fs.readFileSync('media/test/awave.wav'), 'awave.wav')
    //     .field('eventDate', mockData.eventDate)
    //     .field('eventType', mockData.eventType)
    //     .field('mainLead', mockData.mainLead)
    //     .field('memVocals1', mockData.memVocals1)
    //     .then(_res => {
    //       resSet = _res.body;
          
    //       // ----- Amazon S3 -----
    //       aws.config.update({
    //         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    //       });

    //       const s3 = new aws.S3()
    //       const myBucket = process.env.S3_BUCKET_NAME;

    //       let params = {
    //         Bucket: myBucket, 
    //         Key: 'set-audio/'+resSet.files[0].src
    //       };

    //       return s3.deleteObject(params, function(err, data) {
    //         if (err) {
    //           expect.fail(null, null, 'file was not uploaded to aws properly')
    //         };
    //         expect(data).to.not.be.null;
    //         expect(data).to.be.a('object');
    //       }).promise()
    //     })
    //     .then(awsRes => {
    //       expect(date(resSet.eventDate)).to.equal(date(mockData.eventDate));
    //       expect(resSet.eventType).to.equal(mockData.eventType);
    //       expect(resSet.mainLead).to.equal(mockData.mainLead);
    //       expect(resSet.bandMembers[0].instrument).to.equal('Vocals1');
    //       expect(resSet.bandMembers[0].name).to.equal(mockData.memVocals1);
    //       return Set.findById(resSet._id)
    //     })
    //     .then(dbSet => {
    //       expect(resSet.bandMembers).to.deep.equal(dbSet.bandMembers);
    //       expect(resSet.files).to.deep.equal(dbSet.files);
    //       expect(date(resSet.eventDate)).to.equal(date(resSet.eventDate));
    //       expect(resSet.eventType).to.equal(resSet.eventType);
    //       expect(resSet.mainLead).to.equal(resSet.mainLead);
    //     })
    //   })


    // })

    describe('COMMENTS', function() {
      let resSet;

      beforeEach(function() {
        return agent.get('/api/sets').then(res => resSet = res.body[0]).catch(console.log)
      })

      describe('GET comments', function() {
        let resSetNa;
        let resComments;

        it('should get all comments', function() {
          return chai.request(app)
          .get('/api/sets')
          .then(_res => {
            resSetNa = _res.body[0];
            return chai.request(app)
            .get(`/api/sets/${resSetNa._id}/comments`)
            .then(_res => {
              resComments = _res.body;
              expect(resComments).to.be.a('array');
              resComments.forEach(comment => {
                expect(comment).to.be.a('object');
              })
              return Set.find().count()
            })
            .then(count => {
              expect(resComments.length).to.equal(count);
            })
          })
        });

        it('should get comments with the right fields', function() {
          let resSetNa
          return chai.request(app)
          .get('/api/sets')
          .then(_res => {
            resSetNa = _res.body[0];
            return chai.request(app)
            .get(`/api/sets/${resSetNa._id}/comments`)
            .then(_res => {
              _res.body.forEach(comment => {
                expect(comment).to.be.a('object');
                expect(comment.addedBy).to.be.a('object');
                expect(comment).to.include.keys('dateAdded', '_id', 'addedBy', 'comment')
                expect(comment.addedBy).to.include.keys('profilePicture', '_id', 'username')
              })
            })
          })
        });
      });

      describe('POST a comment', function() {

        it('should add a new comment', function() {
          const newComment = {
            comment: 'this is an added comment with a random string: 09023j4023ib3u2t32t90'
          };
          let resComments;

          return agent
          .post(`/api/sets/${resSet._id}/comments`)
          .send(newComment)
          .then(res => {
            resComments = res.body.comments;
            if(res.ok) {
              expect(res.body).to.be.a('object');
              resComments.forEach(comment => {
                expect(comment).to.be.a('object');
                expect(comment).to.include.keys(
                  'dateAdded', '_id', 'comment', 'addedBy'
                )
              });
            }
            else {
              expect(res).to.have.status(500)
            }
            return Set.find({ _id: resSet._id }, { comments: { $elemMatch: { comment: newComment.comment}}})
          })
          .then(setQuery => {
            let dbComment = setQuery[0].comments[0].toObject();
            let resComment = resComments[resComments.length - 1];
            expect(dbComment._id.toString()).to.equal(resComment._id);
            expect(dbComment.addedBy.toString()).to.equal(resComment.addedBy._id);
            expect(dbComment.comment).to.equal(resComment.comment);
          })
        });

        it('should not post a comment with a missing field', function() {
          let commentErrFields = {
            coments: 'this field is missspelled'
          }
          return agent
          .post(`/api/songs/${resSet._id}/comments`)
          .send(commentErrFields)
          .then(res => {
            if (res.ok) {
              expect.fail(null, bull, 'should not have added comment with misspelled field')
            }
            else {
              expect(res).to.have.status(422);
            }
          })
        });

        it('should only allow logged in user to post', function() {
          let comment = { comment: 'this comment should not be added' }
          return chai.request(app)
          .post(`/api/sets/${resSet._id}/comments`)
          .send(comment)
          .then(res => {
            expect(res).to.have.status(401)
          })
        });

      });

      describe('DELETE a comment', function() {
        it('should delete a comment', function() {
          return agent
          .delete(`/api/sets/${resSet._id}/comments`)
          .send({ commentId: resSet.comments[0]._id })
          .then(res => {
            expect(res).to.have.status(204);
            return Set.find({ _id: resSet._id}, { comments: { $elemMatch: { _id: resSet.comments[0]._id }}})
            .then(setQuery => {
              let count = setQuery[0].comments.length;
              expect(count).to.equal(0);
            }) 
          })
        });

        it('should delete a comment only if user is owner', function() {
          let newAgent = chai.request.agent(app);
          return newAgent
          .post('/auth/login')
          .send({ username: newUsers[1].username, password: newUsers[1].password })
          .then((res) => {
            return newAgent
            .delete(`/api/sets/${resSet._id}/comments`)
            .send({ commentId: resSet.comments[0]._id})
            .then(res => {
              if (res.ok) {
                expect.fail(null, null, 'should not have added song with missing artist field')
              }
              else {
                expect(res).to.have.status(403);
                expect(res.body).to.be.a('object');
              }
              return Set.find({ _id: resSet._id}, {comments: { $elemMatch: { _id: resSet.comments[0]._id }}})
            })
            .then(setQuery => {
              let count = setQuery[0].comments.length;
              expect(count).to.equal(1)
            })
          })
        });

      });

      describe('PUT/UPDATE a comment', function() {
        it('should update a comment', function() {
          let commentId = resSet.comments[0]._id;
          let updatedComment = {
            commentId: commentId,
            comment: 'this comment was updated'
          };
          let resComments;
          return agent
          .put(`/api/sets/${resSet._id}/comments`)
          .send(updatedComment)
          .then(res => {
           resComments = res.body;
           expect(res).to.have.status(202);
           expect(res.body).to.be.a('array');
           expect(resComments[0]._id).to.equal(updatedComment.commentId);
           expect(resComments[0].comment).to.equal(updatedComment.comment);
           return Set.findById(`${resSet._id}`)
          })
          .then(set => {
           expect(set.comments[0]._id.toString()).to.equal(updatedComment.commentId);
           expect(set.comments[0].comment).to.equal(updatedComment.comment);
          })
        })

        it('should update a comment only if user is the owner', function() {
          let newAgent = chai.request.agent(app);
          let commentId = resSet.comments[0]._id;
          let updatedComment = {
            commentId: commentId,
            comment: 'this comment should not be updated because user is not authorized'
          }
          return newAgent
          .post('/auth/login')
          .send({ username: newUsers[1].username, password: newUsers[1].password })
          .then(() => {
            return newAgent
            .put(`/api/sets/${resSet._id}/comments`)
            .send(updatedComment)
            .then(res => {
              if (res.ok) {
                expect.fail(null, null, 'should not have modified song since user is not authorized')
              }
              else {
                expect(res).to.have.status(403);
                expect(res.body).to.be.a('object');
                expect(res.body.message).to.equal('Unable to modify. Not Authorized.')
              }
              return Set.find({ _id: resSet._id}, { comments: { $elemMatch: { _id: resSet.comments[0]._id }}})
            })
            .then(setQuery => {
              let set = setQuery[0].comments[0];
              expect(set.comment).to.not.equal(updatedComment.comment);
            });
          });
        });

      }); 

    })

  });

});
