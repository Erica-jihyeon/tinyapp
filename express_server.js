const { request } = require('express');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

/** DATABASE */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/** MIDDLEWARE */
//use bodyParser to handle post request
app.use(bodyParser.urlencoded({extended: true}));

/** TEMPLATE */
//set the view engine to ejs
app.set("view engine", "ejs");


/** TEST */
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/** ROUTE */
/** main page */
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

/** add a new URL */
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  //console.log(req.body);
  //add new key-value into urlDatabase
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  //res.redirect('path'), don't use ':'
  res.redirect(`/urls/${shortURL}`);
});

/** short URL result & hyperlink */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL] }
  res.render("urls_show", templateVars);
});

/** redirect to longURL */
//test input ex> https://www.naver.com, https:// need!!!
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL)
  res.redirect(`${longURL}`);
})




/** SET UP */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

/** FUNCTION */
function generateRandomString() {
  let randomString = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString.push(letters[Math.floor(Math.random() * letters.length)]);
  }
  return randomString.join('');
};