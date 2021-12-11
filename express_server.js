const { request } = require('express');
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const saltRounds = 10;

/** Require helper func */
const { getUserByEmail } = require('./helpers');

/** DATABASE */
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2"
  }
};

const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: bcrypt.hashSync("1234", saltRounds)
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", saltRounds)
  }
};

/** MIDDLEWARE */
//use bodyParser to handle post request
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['this is the key', 'key2']
}));

/** TEMPLATE */
//set the view engine to ejs
app.set("view engine", "ejs");


/** ROUTE */
/** default page */
app.get("/", (req, res) => {
  const userID = req.session.user_id;
  return userID ? res.redirect("/urls") : res.redirect("/login");
});

/** url list page */
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) return res.status(403).send("You're not authorized. Please Login or Register first.");

  const urls = getDataByUserID(userID);
  const templateVars = {
    users,
    userID,
    urls
  };
  res.render("urls_index", templateVars);
});

/** login */
app.get("/login", (req, res) => {
  const loggedin = req.session.user_id;
  if (loggedin) return res.redirect('/urls');

  const templateVars = {
    users,
    userID: req.session.user_id,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) return res.status(400).send("email and password should not be blank!");

  const user = getUserByEmail(email, users);
  if (!user) return res.status(403).send("A user with that email doesn't exist");

  const passwordMatching = bcrypt.compareSync(password, user.password);
  if (!passwordMatching) return res.status(403).send("Your password is incorrect.");
  
  req.session.user_id = user.id;
  res.redirect("/urls");
});

/** logout */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

/** register */
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  if (userID) return res.redirect("/urls");
  
  const templateVars = {
    users,
    userID
  };
  res.render("register", templateVars);
});

app.post("/register/", (req, res) => {
  const { email } = req.body;
  // const email = req.body.email;
  const plainPwd = req.body.password;

  if (!plainPwd) return res.status(400).send("password should not be blank!");
  
  const password = bcrypt.hashSync(plainPwd, saltRounds);

  if (!email) return res.status(400).send("email should not be blank!");
  
  const user = getUserByEmail(email, users);
  if (user) return res.status(400).send("You've already registered. Please log in.");

  const userID = addUserReturnID(email, password);
  
  req.session.user_id = userID;
  res.redirect("/urls");
});



/** add a new URL */
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) return res.redirect("/login");

  const templateVars = {
    users,
    userID
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) return res.status(403).send("You're not authorized.");

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: userID};
  res.redirect(`/urls/${shortURL}`);
});


/** delete URL */
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!userID) return res.status(403).send("You're not authorized. Please login or register first.");
  if (!checkDataAutorized(userID, shortURL)) {
    return res.status(403).send("You're not authorized to access this.");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

/** edit URL */
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;
  if (!userID) return res.status(403).send("You're not authorized. Please login or register first.");
  if (!checkDataAutorized(userID, shortURL)) {
    return res.status(403).send("You're not authorized to access this.");
  }

  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

/** short URL result & hyperlink */
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const userID = req.session.user_id;

  if (!checkValidShortURL(shortURL)) return res.status(403).send("Invalid URL");

  if (!userID) return res.status(403).send("You're not authorized. Please login or register first.");
  if (!checkDataAutorized(userID, shortURL)) {
    return res.status(403).send("You're not authorized to access this.");
  }

  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    users,
    userID
  };
  res.render("urls_show", templateVars);
});



/** redirect to longURL */
//test input ex> https://www.naver.com, https:// need!!!
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!checkValidShortURL(shortURL)) return res.status(400).send("Invalid URL");

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(`${longURL}`);
});



/** SET UP */
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

/** FUNCTION */
const generateRandomString = function() {
  let randomString = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString.push(letters[Math.floor(Math.random() * letters.length)]);
  }
  return randomString.join('');
};

/* check validation of shortURL */
const checkValidShortURL = function(shortURL) {
  for (const key in urlDatabase) {
    if (key === shortURL) return shortURL;
  }
  return null;
};

/* data filtering by user */
const getDataByUserID = function(userID) {
  const result = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      result[shortURL] = {};
      result[shortURL].longURL = urlDatabase[shortURL].longURL;
      result[shortURL].userID = userID;
    }
  }
  return result;
};

/*check if data is the user's data*/
const checkDataAutorized = function(userID, id) {
  if (urlDatabase[id].userID === userID) return true;
  return false;
};

/* add a new user */
const addUserReturnID = function(email, password) {
  const userID = generateRandomString();

  users[userID] = {
    id: userID,
    email,
    password
  };
  return userID;
};