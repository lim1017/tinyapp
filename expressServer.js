
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  let templateVars = { urls: urlDatabase };  //urls is equal to urlDatabase object
  console.log(templateVars)
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };

  if (urlDatabase[req.params.shortURL] === undefined){
    res.send('this URL does not exist')
  }

  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  // console.log(req.body.longURL);  // Log the POST request body to the console
  let random=generateRandomString()
  urlDatabase[random]=req.body.longURL
  // console.log(templateVarscl)
  res.redirect(`/urls/${random}`) //redirect to route not to page.
});





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