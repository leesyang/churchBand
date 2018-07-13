'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../app');
const { User } = require('../models');
const { JWT_SECRET, TEST_DATABASE_URL } = require('../config/constants');

const expect = chai.expect;

chai.use(chaiHttp);

describe('song enpoints', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
    //create some take data
  });

  afterEach(function () {

  });

  describe('/api/songs', function() {
      describe('post', function () {
        it('Should reject a song with no artist', function () {
            return chai
              .request(app)
              .post('/api/songs')
              .then((res) => {
                    if (res.ok) {
                        expect.fail(null, null, 'should not have added song with missing artist field')
                    }
                    else {
                        expect(res).to.have.status(400);
                    }
                })
              .catch(err => {
                if (err instanceof chai.AssertionError) {
                  throw err;
                }
      
                const res = err.response;
                expect(res).to.have.status(400);
              });
          });
        it('should correctly adds a new song', function(){
            // create fake song data
            // do a post request with fake data
            // confirm that the post was added to the database by comparing response to fake data
        })
      });
      describe('get', function() {

      });
      describe('song comments', function () {
        describe('get comments', function() {
            
        });
        describe('put comments', function() {
            
        });
        describe('post comments', function() {
            
        });
        describe('delete comments', function() {
            
        });
      })
  })
});
