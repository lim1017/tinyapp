
const express = require("express");
const app = express();
const cookieParser= require('cookie-parser')


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.set("view engine", "ejs");

const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  // console.log(req.params.shortURL, '          rrres')
  let short=req.params.shortURL
  res.redirect(urlDatabase[short]);
});


app.get("/urls", (req, res) => {


  let templateVars = { urls: urlDatabase, username:undefined };  //urls is equal to urlDatabase object in the .ejs file.
  // console.log(templateVars, ' template vars')

  // console.log(req.cookies, 'cookies ')

  if (req.cookies['username']){
    templateVars.username=req.cookies['username']
  }

  // console.log(templateVars)

  res.render("urls_index", templateVars);

});




app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//page after a url is created && edit page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  
  // console.log(req.params, ' req.params')
  // console.log(templateVars)
  if (urlDatabase[req.params.shortURL] === undefined){
    res.send('this URL does not exist')
  }
  res.render("urls_show", templateVars);
});


//add a new link
app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  console.log(req.params, 'req.params')
  // console.log(req.body, 'req.body.longURL');  // Log the POST request body to the console
  let randomID=generateRandomString()
  urlDatabase[randomID]=req.body.longURL
  // console.log(templateVarscl)
  res.redirect(`/urls/${randomID}`) //redirect to route not to page.
});


//delete a link
app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(req.params, 'req.params')

  delete urlDatabase[req.params.shortURL]
  res.redirect(`/urls`)
});


//update a link
app.post("/urls/:id", (req, res) => {
  console.log(req.params.id, 'req.params')
  console.log(req.body.longURL, 'req.body.long')

  urlDatabase[req.params.id]=req.body.longURL
  res.redirect(`/urls`)

});

//login
app.post("/login", (req, res) => {

console.log(req.body.USER)

res.cookie('username',req.body.USER)

res.redirect(`/urls`)
})







app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString() {
  let randomString=''
  
    for(let i = 0; i<6; i++){
      let random_asciiLetter=Math.floor((Math.random() * 25) + 97);
      randomString+=String.fromCharCode(random_asciiLetter)
    }
  
  return randomString
  }