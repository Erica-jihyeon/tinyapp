/** DATABASE */
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1",
    urlCreatedAt: "12 May 2020",
    visitedTimes: 0
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2",
    urlCreatedAt: "20 October 2020",
    visitedTimes: 0
  }
};

const users = {
  "user1": {
    id: "user1",
    email: "user@example.com",
    password: "123"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "123"
  }
};

/* get user data by Email */
const getUserByEmail = function(email, database) {
  
  for (const user in database) {
    if (database[user].email === email) return database[user];
  }
  return undefined;
};

/* generate random string */
const generateRandomString = function() {
  let randomString = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  while(randomString.length < 6) {
    randomString += (letters[Math.floor(Math.random() * letters.length)]);
  }
  return randomString;
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
      result[shortURL].urlCreatedAt = urlDatabase[shortURL].urlCreatedAt;
      result[shortURL].visitedTimes = urlDatabase[shortURL].visitedTimes;
    }
  }
  return result;
};

/*check if data is the user's data*/
const checkDataAuthorized = function(userID, id) {
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


module.exports = { getUserByEmail, generateRandomString, checkValidShortURL, getDataByUserID, checkDataAuthorized, addUserReturnID, urlDatabase, users };