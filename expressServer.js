const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const saltRounds = 3;
const bodyParser = require("body-parser");

const {
  checkForEmail,
  lookUp3rdArgwith1st,
  lookUpURLSbyID,
  generateRandomString,
  makePersonalUrlObj
} = require("./tinyfunctions");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
);

app.set("view engine", "ejs");

const PORT = 8080; // default port 8080

const urlDatabase = {
  // admin owns these default links  login with admin@tinyurl.com///admin
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin",
    shortURL: "b2xVn2"
  },
  asm5xK: {
    longURL: "http://www.google.com",
    userID: "admin",
    shortURL: "asm5xK"
  }
};

const users = {
  admin: {
    // to login pw is admin
    id: "admin",
    email: "admin@tinyurl.com",
    password: "$2b$04$GpszQOD0UeM7XE9Ey6VY2ekLujaTSJg5ZWDFbKAMvB.rgWGcZeLK."
  }
};

// Start of paths
app.get("/", (req, res) => {
  if (req.session["ID"] === undefined) {
    res.redirect(`/login`);
  } else if (req.session.ID) {
    templateVars.id = req.session.ID;
    templateVars.email = req.session.email;
  }

  let templateVars = { urls: urlDatabase, id: undefined, user: users }; //urls is equal to urlDatabase object in the .ejs file.
  res.redirect(`/urls`);
});

//home page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, id: undefined, user: users }; //urls is equal to urlDatabase object in the .ejs file.

  if (req.session.ID) {
    templateVars.id = req.session.ID;
    templateVars.email = req.session.email;
  }

  templateVars.urls = makePersonalUrlObj(urlDatabase, req.session.ID);

  res.render("urls_index", templateVars);
});

//short link redirect to longurl
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;

  if (urlDatabase[req.params.shortURL] === undefined) {
    res.statusCode = 400;

    res.send("400 Bad Request, This URL does not exist");
  }

  let link2LongURL = lookUp3rdArgwith1st(
    short,
    urlDatabase,
    "longURL",
    "shortURL"
  );

  res.redirect(link2LongURL);
});

//create new link page
app.get("/urls/new", (req, res) => {
  if (req.session["ID"] === undefined) {
    res.redirect(`/login`);
  }

  let templateVars = { id: req.session["ID"], email: req.session["email"] };
  res.render("urls_new", templateVars);
});

//page after a url is created && edit page///
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

//Actully making a new link
app.post("/urls", (req, res) => {
  let templateVars = {
    longURL: urlDatabase[req.params.shortURL],
    id: req.session["ID"],
    email: req.session["email"],
    urls: urlDatabase
  };

  //adds http to links the begining of links without
  let longURL=req.body.longURL
  if (!longURL.startsWith('http://')){
    longURL='http://'+longURL
  }


  let randomID = generateRandomString(6);
  urlDatabase[randomID] = {
    longURL: longURL,
    shortURL: randomID,
    userID: req.session["ID"]
  };

  res.redirect(`/urls/${randomID}`); //redirect to route not to page.
});

//delete a link
app.post("/urls/:shortURL/delete", (req, res) => {
  let tinyArr = lookUp3rdArgwith1st(
    req.session["ID"],
    urlDatabase,
    "shortURL",
    "userID"
  ); //only the owner of the url can delete

  if (req.session["ID"] === undefined) {
    res.statusCode = 400;
    res.end("400 Bad Request, Please login to use TinyURL");
  } else if (tinyArr !== urlDatabase[tinyArr].shortURL) {
    //(tinyArr.indexOf(req.params.shortURL) === -1)
    res.statusCode = 400;
    res.end("400 Bad Request, Can not delete, this is not your URL");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  }
});

//update a link/////////////////////
app.post("/urls/update/:shortURL", (req, res) => {

  let longURL=req.body.longURL
  
  if (!longURL.startsWith('http://')){
    longURL='http://'+longURL
  }

  urlDatabase[req.params.shortURL].longURL = longURL;



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

  if (req.session["ID"] !== undefined) {
    res.redirect(`/urls`);
  }

  res.render(`urls_register`, templateVars);
});

//register new account
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.statusCode = 400;
    res.end("400 Bad Request, Email or Password empty");
  } else if (checkForEmail(email, users)) {
    //email already exists??
    res.statusCode = 401;
    res.end("401 Bad Request, Email already exists");
  } else {
    let randomUserID = generateRandomString(8);

    users[randomUserID] = {
      id: randomUserID,
      email: email
    };

    bcrypt.hash(password, saltRounds, function(err, hash) {
      //encrypts the password
      users[randomUserID].password = hash; //stores the encrpted pw in users obj
    });
    req.session.ID = users[randomUserID].id;
    req.session.email = users[randomUserID].email;
    res.redirect(`/urls`);
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (checkForEmail(email, users)) {
    if (
      bcrypt.compareSync(
        password,
        users[lookUp3rdArgwith1st(email, users, "id", "email")].password
      )
    ) {
      //if pw match
      req.session.ID = lookUp3rdArgwith1st(email, users, "id", "email");
      req.session.email = email;
      res.redirect(`/urls`);
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

  
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
