const { assert } = require('chai');

const { lookUpURLSbyID } = require('../tinyfunctions.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


const urlDatabase = {
  // admin owns these default links  login with admin@tinyurl.com///admin
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    shortURL: "b2xVn2"
  },
  asm5xK: {
    longURL: "http://www.google.com",
    userID: "userRandomID",
    shortURL: "asm5xK"
  }
};



describe('lookUpURLSbyID', function() {
  it('should return an arry of 2 URLs belonging to the user', function() {
    const user = JSON.stringify(lookUpURLSbyID("userRandomID", urlDatabase, "shortURL"))
    const expectedOutput = JSON.stringify( ["b2xVn2","asm5xK"])
   

    assert.equal(user,expectedOutput)
  });
});


describe('lookUpURLSbyID', function() {
  it('should return an empty arry for randomUser2', function() {
    const user = JSON.stringify(lookUpURLSbyID("user2RandomID", urlDatabase, "shortURL"))
    const expectedOutput = JSON.stringify( [])
   

    assert.equal(user,expectedOutput)
  });
});


