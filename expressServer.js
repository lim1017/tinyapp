const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const PORT = 8080; // default port 8080

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

const users = {
  userRandomID1: {
    id: "userRandomID",
    email: "user@example.com",
    password: "asdf"
  },
  userRandomID2: {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "asdf"
  }
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, id: undefined, user: users }; //urls is equal to urlDatabase object in the .ejs file.
  // console.log(templateVars, ' template vars')
  // console.log(req.cookies.ID, 'cookies ')
  if (req.cookies.ID) {
    templateVars.id = req.cookies.ID;
    templateVars.email = req.cookies.email;
  }
  // console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  res.redirect(urlDatabase[short]);
});

//create new link
app.get("/urls/new", (req, res) => {

  if ( req.cookies["ID"]=== undefined){
    res.redirect(`/login`)
  }

  let templateVars = { id: req.cookies["ID"], email: req.cookies['email']};
  res.render("urls_new", templateVars);
});

//page after a url is created && edit page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    id: req.cookies["ID"],
    email: req.cookies['email']
  };
  // console.log(req.params, ' req.params')
  // console.log(templateVars)
  if (urlDatabase[req.params.shortURL] === undefined) {
    res.send("this URL does not exist");
  }
  res.render("urls_show", templateVars);
});

//add a new link
app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  console.log(req.params, "req.params");
  // console.log(req.body, 'req.body.longURL');  // Log the POST request body to the console
  let randomID = generateRandomString(6);
  urlDatabase[randomID] = req.body.longURL;
  // console.log(templateVarscl)
  res.redirect(`/urls/${randomID}`); //redirect to route not to page.
});

//delete a link
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params, 'req.params')

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
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
  let templateVars = { id: req.cookies["id"] };
  res.render(`urls_login`, templateVars);
});

//to register page
app.get("/register", (req, res) => {
  let templateVars = { id: req.cookies["id"] };
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
      password: password
    };

    // console.log(users[randomUserID])
    res.cookie("ID", users[randomUserID].id);
    res.cookie("email", users[randomUserID].email);

    res.redirect(`/urls`);
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("ID");
  res.clearCookie("email");

  res.redirect(`/urls`);
});


//login
app.post("/login", (req, res) => {
  const { email, password} = req.body;

  if (checkForEmail(email, users)) {
    // if (lookUp3rdArgwith1st(email, users, "id")===id) {
      if (lookUp3rdArgwith1st(email, users, "password")===password) {
        res.cookie("ID", lookUp3rdArgwith1st(email, users, "id"));
        res.cookie("email", email);
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

function lookUp3rdArgwith1st(arg1, obj, arg3) {
  for (id in obj) {
    // console.log(obj[id].email, 'obj[id].email')
    if (obj[id].email === arg1) {
      // console.log(obj[id].arg3, 'obj[id].arg3')
      return obj[id][arg3];
    }
  }

  return "";
}
