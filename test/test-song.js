'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../app');
const { Song, User } = require('../models');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config/constants');

const expect = chai.expect;

chai.use(chaiHttp);

// ---- helper functions -----
const DateObj = (date) => {
  let dateObject = new Date(date);
  return dateObject;
}

// ---- generate users -----
let newUsers = [];
let dbUsers = [];

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

// ----- generate a song comment ------
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

// ----- generate a song -----
function generateSong (userId) {
  let commentsArray = seedComments(userId);
  return {
    dateAdded: Date.now(),
    addedBy: userId,
    artist: 'Hillsong',
    title: 'So Will I',
    tempo: 'Slow',
    theme: 'Adoration',
    releaseYear: '2018',
    links: { 
      youtube: 'http://www.youtube.com/',
      spotify: 'http://www.spotify.com/'
    },
    lyrics: 'N/A',
    rank: 1,
    comments: commentsArray,
  }
}

function generateSongInputted (userId) {
  return {
    addedBy: userId,
    artist: 'Hillsong',
    title: 'So Will I',
    tempo: 'Slow',
    theme: 'Adoration',
    releaseYear: '2018',
    youtube: 'http://www.youtube.com/',
  }
};

function seedSongData (users) {
  let songs = [];
  for ( let i = 0; i < users.length; i++) {
    songs.push(generateSong(users[i]._id));
  }
  return Song.insertMany(songs);
};

// ---- drop the database -----
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('song endpoints', function () {

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

  describe('/api/songs', function() {
    
    // ----- code that runs before each of the blocks below ------
    beforeEach(function(){
      return seedSongData(dbUsers)
    });

    // ----- agent for auth requests -----
    let agent = chai.request.agent(app);

    beforeEach(function() {
      return agent
      .post('/auth/login')
      .send({ username: newUsers[0].username, password: newUsers[0].password })
    });


    describe('GET /api/songs', function() {
      
      it('should get list of songs', function() {
        let res;
        return chai.request(app)
        .get('/api/songs')
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          return Song.count();
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

      it('should get list of songs with the right fields', function() {
        let resSong;

        return chai.request(app)
        .get('/api/songs')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          res.body.forEach(function(song) {
            expect(song).to.be.a('object');
            expect(song).to.include.keys(
              'dateAdded', '_id', 'addedBy', 'artist', 'title', 
              'links', 'theme', 'releaseYear', 'tempo', 'comments')
          })
          resSong = res.body[0];
          return Song.findById(resSong._id)
        })
        .then(song => {
          let dbSong = song.toObject();

          let excludeKeys = (word) => {
            // include keys: artist and title
            let filterWords = ['comments', 'links', 'dateAdded', '__v', '_id', 'addedBy'];
            for ( let i = 0; i < filterWords.length; i++ ) {
              if (word == filterWords[i]) {
                return false
              }
            }
            return true;
          };

          // key: addedby is populated
          Object.keys(dbSong).filter(excludeKeys).forEach((key) => {
            expect(dbSong[key].toString()).to.equal(resSong[key].toString())
          })
        })
      })
    });

    describe('POST /api/songs', function() {
      it('should add a new song', function() {
        let newSong = generateSongInputted(dbUsers[0]._id);
        return agent
        .post('/api/songs')
        .send(newSong)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'dateAdded', 'addedBy', 'artist', 'title', '_id', 'links', 'releaseYear', 'tempo'
          );
          expect(res.body._id).to.not.be.null;
          expect(res.body.artist).to.equal(newSong.artist);
          expect(res.body.title).to.equal(newSong.title);
          return Song.findById(res.body._id)
        })
        .then(song => {
          let dbSong = song.toObject();
          Object.keys(newSong).filter(word => !(word == 'youtube')).forEach(key => {
            expect(newSong[key].toString()).to.equal(dbSong[key].toString());
          })
        })
      })

      it('should not add a new song', function() {
        let songMinFields = {
          artist: 'Hillsong',
          title: 'So Will I'
        };
        let songMissingFields = {
          artist: 'Hillsong'
        };
        
        return agent
        .post('/api/songs')
        .send(songMinFields)
        .then(res => {
          expect(res).to.have.status(201)
          return agent
          .post('/api/songs')
          .send(songMissingFields)
          .then(res => {
            if (res.ok) {
              expect.fail(null, null, 'should not have added song with missing artist field')
            }
            else {
              expect(res).to.have.status(422);
            }
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }
          })
        })
      })
    });

    describe('COMMENTS', function () {
      let resSong;
      
      // ----- grab the latest generated songs and save to resSong -----
      beforeEach(function() {
        return agent.get('/api/songs').then(res => resSong = res.body[0]).catch(console.log)
      })

      describe('GET comments', function() {
        it('should get all comments', function() {
          let resSongs; 
          let resComments;
          return chai.request(app)
          .get('/api/songs')
          .then(res => {
            resSongs = res.body;
            return chai.request(app)
            .get(`/api/songs/${resSongs[0]._id}/comments`)
            .then(_res => {
              resComments = _res.body;
              expect(_res).to.have.status(200);
              expect(_res).to.be.json;
              expect(_res.body).to.be.a('array');
              return Song.findById(resSongs[0]._id)
            })
            .then(_res => {
              let count = _res.comments.length;
              expect(resComments).to.have.lengthOf(count)
            })
          })
        })

        it('should get comments with the right fields', function() {
          return agent
          .get('/api/songs')
          .then(res => {
            return agent
            .get(`/api/songs/${res.body[0]._id}/comments`)
            .then(res => {
              expect(res).to.have.status(200);
              expect(res).to.be.json;
              expect(res.body).to.be.a('array');
              res.body.forEach(comment => {
                expect(comment).to.be.a('object');
                expect(comment).to.include.keys(
                  'dateAdded', '_id', 'comment', 'addedBy'
                )
                expect(comment.addedBy).to.include.keys(
                  'profilePicture', '_id', 'username'
                )
              })
            });
          })
        })

      });

      describe('POST a comment', function() {
        it('should post a new comment', function () {
          const newComment = {
            comment: 'this is an added comment with a random string: 09023j4023ib3u2t32t90'
          }

          let resComments;

          return agent
          .post(`/api/songs/${resSong._id}/comments`)
          .send(newComment)
          .then(res => {
            resComments = res.body;
            if (res.ok) {
              expect(res.body).to.be.a('array')
              res.body.forEach(comment => {
                expect(comment).to.be.a('object')
                expect(comment).to.include.keys(
                  'dateAdded', '_id', 'comment', 'addedBy'
                )
              });
            }
            else {
              expect(res).to.have.status(500);
            }
            
            return Song.find({_id: resSong._id}, { comments: { $elemMatch: { comment: newComment.comment }}})
          })
          .catch(err => {
            console.log('innerERROR', err);
          })
          .then(songQuery => {
            console.log(songQuery[0].comments[0]);
            let dbComment = songQuery[0].comments[0].toObject();
            let resComment = resComments[resComments.length - 1];
            expect(dbComment._id.toString()).to.equal(resComment._id);
            expect(dbComment.addedBy.toString()).to.equal(resComment.addedBy._id);
            expect(dbComment.comment).to.equal(resComment.comment);
          })
        });

        it('should not post a comment with missing field', function() {
          let commentErrFields = {
            coments: 'this field is missspelled'
          }

          return agent
          .post(`/api/songs/${resSong._id}/comments`)
          .send(commentErrFields)
          .then(res => {
            if (res.ok) {
              expect.fail(null, null, 'should not have added comment with misspelled field')
            }
            else {
              expect(res).to.have.status(422);
            }
          })
        });

        it('should only allow logged in user to post', function() {
          let comment = { comment: 'this comment should not be added' }
          return chai.request(app)
          .post('/api/songs')
          .send(comment)
          .then(res => {
            expect(res).to.have.status(401)
          })
        })

      });

      describe('DELETE a comment', function() { //
        it('should delete a comment', function () {
          return agent
          .delete(`/api/songs/${resSong._id}/comments`)
          .send({ commentId: resSong.comments[0]._id })
          .then(res => {
            expect(res).to.have.status(204);
            return Song.find({ _id: resSong._id}, { comments: { $elemMatch: { _id: resSong.comments[0]._id }}})
          })
          .then(songQuery => {
            let count = songQuery[0].comments.length;
            expect(count).to.equal(0);
          })
        });

        it('should only delete a comment if user is the owner', function() {
          let newAgent = chai.request.agent(app)
          return newAgent
          .post('/auth/login')
          .send({ username: newUsers[1].username, password: newUsers[1].password })
          .then((res) => {
            return newAgent
            .delete(`/api/songs/${resSong._id}/comments`)
            .send({ commentId: resSong.comments[0]._id})
            .then(res => {
              if (res.ok) {
                expect.fail(null, null, 'should not have added song with missing artist field')
              }
              else {
                expect(res).to.have.status(403);
                expect(res.body).to.be.a('object');
              }
              return Song.find({ _id: resSong._id}, { comments: { $elemMatch: { _id: resSong.comments[0]._id }}})
            })
            .then(songQuery => {
              let count = songQuery[0].comments.length;
              expect(count).to.equal(1);
            })
          })
        });

      });

      describe('PUT/UPDATE a comment', function() {
         it('should update a comment', function() {
           let commentId = resSong.comments[0]._id;
           let updatedComment = {
             commentId: commentId,
             comment: 'this comment was updated'
           };
           let resComments;
           return agent
           .put(`/api/songs/${resSong._id}/comments`)
           .send(updatedComment)
           .then(res => {
            resComments = res.body;
            expect(res).to.have.status(202);
            expect(res.body).to.be.a('array');
            expect(resComments[0]._id).to.equal(updatedComment.commentId);
            expect(resComments[0].comment).to.equal(updatedComment.comment);
            return Song.findById(`${resSong._id}`)
           })
           .then(song => {
            expect(song.comments[0]._id.toString()).to.equal(updatedComment.commentId);
            expect(song.comments[0].comment).to.equal(updatedComment.comment);
           })
         })

        it('should update a comment only if user is the owner', function() {
          let newAgent = chai.request.agent(app);
          let commentId = resSong.comments[0]._id;
          let updatedComment = {
            commentId: commentId,
            comment: 'this comment should not be updated because user is not authorized'
          }
          return newAgent
          .post('/auth/login')
          .send({ username: newUsers[1].username, password: newUsers[1].password })
          .then(() => {
            return newAgent
            .put(`/api/songs/${resSong._id}/comments`)
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
              return Song.find({ _id: resSong._id}, { comments: { $elemMatch: { _id: resSong.comments[0]._id }}})
            })
            .then(songQuery => {
              let song = songQuery[0].comments[0];
              expect(song.comment).to.not.equal(updatedComment.comment);
            });
          });
        });
      });
      
    });

  });

});
