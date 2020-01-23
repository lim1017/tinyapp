function checkForEmail(emails, obj) {
  let users = Object.keys(obj);

  for (user of users) {
    if (obj[user].email === emails) {
      return true;
    }
  }
  return false;
}

function lookUp3rdArgwith1st(arg1, obj, arg3, stringOFarg1) {
  for (id in obj) {
    if (obj[id][stringOFarg1] === arg1) {
      return obj[id][arg3];
    }
  }
}

function lookUpURLSbyID(ID, obj, arg3) {
  let UrlArray = [];

  for (url in obj) {
    if (obj[url].userID === ID) {
      UrlArray.push(obj[url][arg3]);
    }
  }

  return UrlArray;
}

function generateRandomString(num) {
  let randomString = "";

  for (let i = 0; i < num; i++) {
    let random_asciiLetter = Math.floor(Math.random() * 25 + 97);
    randomString += String.fromCharCode(random_asciiLetter);
  }
  return randomString;
}


function makePersonalUrlObj(obj, id){
  const copys = {}
  for (let key in obj) {
  
    if (id === obj[key].userID) {
      copys[key]=obj[key]
    }  
  }
  return copys
  }


module.exports={
  checkForEmail,
  lookUp3rdArgwith1st,
  lookUpURLSbyID,
  generateRandomString,
  makePersonalUrlObj
}