const { request } = require('express');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

/** DATABASE */
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "123"
  }
}

/** MIDDLEWARE */
//use bodyParser to handle post request
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/** TEMPLATE */
//set the view engine to ejs
app.set("view engine", "ejs");


/** ROUTE */
/** main page */
app.get("/urls", (req, res) => {
  const templateVars = {
    users,
    userID: req.cookies["user_id"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

/** login */
app.get("/login", (req, res) => {
  const templateVars = {
    users,
    userID: req.cookies["user_id"],
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) return res.status(400).send("email and password should not be blank!");

  const user = findUserByEmail(email);

  if(!user) return res.status(403).send("A user with that email doesn't exist");
  if(user.password !== password) {
    return res.status(403).send("Your password is incorrect.")
  }
  res.cookie("user_id", user.id)
  res.redirect("/urls");
});

/** logout */
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
})

/** register */
app.get("/register", (req, res) => {
  const templateVars = {
    users,
    userID: req.cookies["user_id"],
  };
  res.render("register", templateVars);
})

app.post("/register/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password) return res.status(400).send("email and password should not be blank!");

  const user = findUserByEmail(email);
  if(user) return res.status(400).send("You've already registered. Please log in.")

  const userID = generateRandomString();
  users[userID] = {
    id: userID,
    email,
    password
  }
  res.cookie('user_id', userID);
  res.redirect("/urls");
})



/** add a new URL */
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users,
    userID: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


/** delete URL */
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

/** edit URL */
app.post("/urls/:id", (req, res) => {
  const newLongURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
})




/** short URL result & hyperlink */
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL],
    users,
    userID: req.cookies["user_id"]
  }
  res.render("urls_show", templateVars);
});

/** redirect to longURL */
//test input ex> https://www.naver.com, https:// need!!!
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  //console.log(longURL)
  res.redirect(`${longURL}`);
});



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

function findUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) return users[user];
  }
  return null;
}
