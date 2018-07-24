'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const shortid = require('shortid');

const { app, runServer, closeServer } = require('../app');
const { Song, Set, User } = require('../models');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config/constants');

const expect = chai.expect;

chai.use(chaiHttp);

// ---- helper functions -----
const DateObj = (date) => {
  let dateObject = new Date(date);
  return dateObject;
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
          console.log(res.body);
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
          expect(dbSong.dateAdded).to.equal(resSong.dateAdded);
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

    describe('POST a new set ', function() {
      it('should upload set with the right fields', function() {

      });

      

      it('should only upload set with files', function() {

      })


    })

    describe('COMMENTS', function() {
      let resSet;

      beforeEach(function() {
        return agent.get('/api/sets').then(res => resSet = res.body[0]).catch(console.log)
      })

      describe('GET comments', function() {

      });

      describe('POST a comment', function() {

      });

      describe('DELETE a comment', function() {

      });

      describe('PUT/UPDATE a comment', function() {

      });

    })

  });

});
