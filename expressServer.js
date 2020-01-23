const express = require("express");
const app = express();
const cookieSession = require('cookie-session')


const bcrypt = require('bcrypt');
const saltRounds = 3;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.set("view engine", "ejs");

const PORT = 8080; // default port 8080

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID1",
    shortURL: "b2xVn2"
  },
  asm5xK: {
    longURL: "http://www.google.com",
    userID: "userRandomID1",
    shortURL: "asm5xK"
  }
};

const users = {
  userRandomID1: {
    id: "userRandomID1",
    email: "user@example.com",
    password: "asdf"
  },
  userRandomID2: {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "asdf"
  }
};

app.get("/", (req, res) => {
  
  let templateVars = { urls: urlDatabase, id: undefined, user: users }; //urls is equal to urlDatabase object in the .ejs file.

  if (req.session["ID"] === undefined) {
    res.redirect(`/login`);
  }  else if (req.session.ID) {
    templateVars.id = req.session.ID;
    templateVars.email = req.session.email;
  }

  res.redirect(`/urls`)
});



//home page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, id: undefined, user: users }; //urls is equal to urlDatabase object in the .ejs file.

  if (req.session.ID) {
    templateVars.id = req.session.ID;
    templateVars.email = req.session.email;
  }
  res.render("urls_index", templateVars);
});


//short link redirect to longurl
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  
  
  let link2LongURL= lookUp3rdArgwith1st(short, urlDatabase, 'longURL', 'shortURL')


  res.redirect(link2LongURL);
});




//create new link
app.get("/urls/new", (req, res) => {
  if (req.session["ID"] === undefined) {
    res.redirect(`/login`);
  }

  let templateVars = { id: req.session["ID"], email: req.session["email"] };
  res.render("urls_new", templateVars);
});

//page after a url is created && edit page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    id: req.session["ID"],
    email: req.session["email"],
    urls: urlDatabase
  };

  let tinyArr = lookUpURLSbyID(req.session["ID"], urlDatabase, "shortURL");

  if (req.session["ID"] === undefined) {
    res.statusCode = 400;

    res.send("400 Bad Request, Please Login to edit Urls");
  }

  if (urlDatabase[req.params.shortURL] === undefined) {
    res.statusCode = 400;

    res.send("400 Bad Request, This URL does not exist");
  }

  if (tinyArr.indexOf(req.params.shortURL) === -1) {
    res.statusCode = 400;
    res.end("400 Bad Request, This is not your URL");
  }

  res.render("urls_show", templateVars);
});

//add a new link
app.post("/urls", (req, res) => {

  let templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    id: req.session["ID"],
    email: req.session["email"],
    urls: urlDatabase
  };
  
  console.log(req.body.longURL, 'req.body.longURL');  // Log the POST request body to the console
  let randomID = generateRandomString(6);
  urlDatabase[randomID]={
    longURL : req.body.longURL,
    shortURL : randomID,
    userID: req.session["ID"]
  }

  // console.log(templateVarscl)
  res.redirect(`/urls/${randomID}`); //redirect to route not to page.
});

//delete a link
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params, 'req.params')

  let tinyArr = lookUpURLSbyID(req.session["ID"], urlDatabase, "shortURL");  //only the owner of the url can delete
  if (tinyArr.indexOf(req.params.shortURL) === -1) {
    res.statusCode = 400;
    res.end("400 Bad Request, Can not delete, this is not your URL");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

//update a link
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id, "req.params");
  console.log(req.body.longURL, "req.body.long");

  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

//to login page
app.get("/login", (req, res) => {
  let templateVars = { id: req.session["id"] };
  res.render(`urls_login`, templateVars);
});

//to register page
app.get("/register", (req, res) => {
  let templateVars = { id: req.session["id"] };
  res.render(`urls_register`, templateVars);
});

//register new account
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.statusCode = 400;
    res.end("400 Bad Request, Email or Password empty");
  } else if (checkForEmail(email, users)) {
    //email already exists
    console.log(checkForEmail(email, users));

    res.statusCode = 401;
    res.end("401 Bad Request, Email already exists");
  } else {
    let randomUserID = generateRandomString(8);

    users[randomUserID] = {
      id: randomUserID,
      email: email, 
    };

    bcrypt.hash(password, saltRounds, function(err, hash) {   //encrypts the password 
      users[randomUserID].password=hash                       //stores the encrpted pw in users obj
    });

    // console.log(users[randomUserID])
    req.session.ID=users[randomUserID].id
    req.session.email=users[randomUserID].email
    res.redirect(`/urls`);
  }
});

//logout
app.post("/logout", (req, res) => {
  // res.clearCookie("ID");
  // res.clearCookie("email");
  req.session = null

  res.redirect(`/urls`);
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (checkForEmail(email, users)) {
    if(bcrypt.compareSync(password, users[lookUp3rdArgwith1st(email, users, "id", 'email')].password)){

      req.session.ID = lookUp3rdArgwith1st(email, users, "id", 'email')
      req.session.email= email
    } else {
      res.statusCode = 403;
      res.end("403 Incorrect password");
    }
    // }
  } else {
    //email not exists
    res.statusCode = 403;
    res.end("403 E-mail not found");
  }

  // res.cookie('email',req.body.email)
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(num) {
  let randomString = "";

  for (let i = 0; i < num; i++) {
    let random_asciiLetter = Math.floor(Math.random() * 25 + 97);
    randomString += String.fromCharCode(random_asciiLetter);
  }
  return randomString;
}

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
      console.log(obj[id][arg3], 'obj[id].arg3')
      return obj[id][arg3];
    }
  }
}

function lookUpURLSbyID(ID, obj, arg3) {
  let UrlArray = [];

  for (url in obj) {
    if (obj[url].userID === ID) {
      console.log(obj[url][arg3], "asdfasdjfkasdfasdfsadfasdfsadfajsdfhkjasdfh");
      UrlArray.push(obj[url][arg3]);
    }
  }

  return UrlArray;
}
