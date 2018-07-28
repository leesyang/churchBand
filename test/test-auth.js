'use strict';
const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const aws = require('aws-sdk');

const { app, runServer, closeServer } = require('../app');
const { User } = require('../models');
const { TEST_DATABASE_URL } = require('../config/constants');

const expect = chai.expect;

chai.use(chaiHttp);

// ---- helper functions -----
function date (date) {
  return new Date(date).toISOString();
}

// ---- generate users -----
let dbUsers = []; // contains hashed pw
let newUsers = [];

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

  describe('/auth/', function() {
    let userLogin;

    beforeEach(function() {
      userLogin = { username: newUsers[0].username, password: newUsers[0].password };
    })

    describe('POST /auth/login', function() {
      it('should log in a user with the correct username and password', function() {
        let agent = chai.request.agent(app);
        return agent
        .post('/auth/login')
        .send(userLogin)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.have.cookie('authToken');
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('authToken');
          return agent
          .get('/home')
          .then(res => {
            expect(res).to.have.status(200);
          })
        })
      });

      it('should not log in a user with wrong credentials', function() {
        return chai.request(app)
        .post('/auth/login')
        .send({ username: newUsers[0].username, password: 'passit32g' })
        .then(res => {
          if (res.ok) {
            expect.fail(null, null, 'should not have been able to log in with incorrect password')
          }
          else {
            expect(res).to.have.status(422);
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('reason', 'location', 'message');
            expect(res.body.message).to.equal('Incorrect password');
          }
          return chai.request(app)
          .post('/auth/login')
          .send({ username: 'u5ernam3', password: newUsers[0].password })
          .then(res => {
            if (res.ok) {
              expect.fail(null, null, 'should not have been able to log in with incorrect username')
            }
            else {
              expect(res).to.have.status(422);
              expect(res.body).to.be.a('object');
              expect(res.body).to.include.keys('reason', 'location', 'message');
              expect(res.body.message).to.equal('Incorrect username');
            }
            return chai.request(app)
            .post('/auth/login')
            .send({ username: 'uSer2name', password: 'pa33words5'})
            .then(res => {
              expect(res).to.have.status(422);
            })
          })
        })
      });

    });

    describe('GET /auth/logout', function() {
      it('should clear the client cookie authToken', function() {
        let loginAgent = chai.request.agent(app);
        return loginAgent
        .post('/auth/login')
        .send(userLogin)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.have.cookie('authToken');
          return loginAgent
          .get('/auth/logout')
          .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.not.have.cookie('authToken');
            return loginAgent
            .get('/home')
            .then(res => {
              expect(res).to.have.status(200)
              expect(res.cookies).to.be.undefined;
            })
          })
        })
      });

    })

    describe('POST /users', function() {
      it('should add a new user', function() {
        this.timeout(5000)
        let newUser = generateUserSignup();
        let newUserAgent = chai.request.agent(app);
        let dbUser;

        return newUserAgent
        .post('/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('username', 'firstName', 'lastName', 'profilePicture', 'id');
          return User.findById(res.body.id)
        })
        .then(user => {
          dbUser = user;
          expect(user.username).to.equal(newUser.username);
          expect(user.email).to.equal(newUser.email);
          expect(user.firstName).to.equal(newUser.firstName);
          expect(user.lastName).to.equal(newUser.lastName);
          return user.validatePassword(newUser.password, dbUser.password)
        })
        .then(funcRes => { 
          expect(funcRes).to.be.true;
        })
      });

      it('should not add user with missing field', function() {
        let newUserInfo = {
          username: 'myusername',
          password: 'mypassword',
          email: 'myemail',
          firstNam: 'this field is misspelled, so it is missing',
          lastName: 'mylastname'
        };

        return chai.request(app)
        .post('/users')
        .send(newUserInfo)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('code', 'reason', 'message', 'location')
          return User.find({ username: newUserInfo.username }).count()
        })
        .then(count => {
          expect(count).to.equal(0);
        })

      });

      it('should not add user if email and username is not unique', function() {
        let { firstName, lastName, email, username, password } = newUsers[0]

        return chai.request(app)
        .post('/users')
        .send({ username: 'myuniqueusername1295', lastName, firstName, email, password  })
        .then(res => {
          expect(res).to.have.status(422);
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Email already taken');
          return chai.request(app)
          .post('/users')
          .send({ username, lastName, firstName, email: 'myuniqueEmail346346', password })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body).to.be.a('object')
            expect(res.body.message).to.equal('Username already taken');
          })
        })
      });

    });

    describe('PUT /users', function() {
      it('should upload profile picture of user', function() {
        this.timeout(15000);
        let newAgent = chai.request.agent(app);
        let { firstName } = newUsers[0];

        let userExp = {
          instr1: 'Piano',
          skill1: 'Still Learning',
          instr2: 'Piano',
          skill2: 'Still Learning',
          instr3: 'Piano',
          skill3: 'Still Learning'
        };

        return newAgent
        .post('/auth/login')
        .send(userLogin)
        .then(res => {
          expect(res).to.have.status(200);
          return newAgent
          .put('/users')
          .attach('userImg', fs.readFileSync('media/test/aprofileimg.png'), 'aprofileimg.png')
          .field('instr1', userExp.instr1)
          .field('skill1', userExp.skill1)
          .then(res => {
            let resUser = res.body;
            // ----- Amazon S3 -----
            aws.config.update({
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });

            const s3 = new aws.S3()
            const myBucket = process.env.S3_BUCKET_NAME;

            let params = {
              Bucket: myBucket, 
              Key: 'user-profile-images/'+resUser.profilePicture
            };

            return s3.deleteObject(params, function(err, data) {
              if (err) {
                expect.fail(null, null, 'file was not uploaded to aws properly')
              };
              expect(data).to.not.be.null;
              expect(data).to.be.a('object');
            }).promise()
          })
          .then(awsRes => {
            expect(awsRes).to.be.a('object');
          })
        })
      });

      it('should update user profile', function() {
        let newAgent = chai.request.agent(app);
        let { firstName, lastName, email } = newUsers[0];

        let updatedInfo = {
          firstName,
          lastName,
          email,
          lastName: 'newLastName'
        };

        return newAgent
        .post('/auth/login')
        .send(userLogin)
        .then(res => {
          return newAgent
          .put('/users')
          .send(updatedInfo)
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.a('object');
            expect(res.body.lastName).to.equal(updatedInfo.lastName);
            return User.findById(res.body.id)
          })
          .then(user => {
            expect(user.firstName).to.equal(updatedInfo.firstName);
            expect(user.lastName).to.equal(updatedInfo.lastName);
            expect(user.email).to.equal(updatedInfo.email);
          })

        })
      });

    })

  });

});
