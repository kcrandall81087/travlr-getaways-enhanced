const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // enable JSON web tokens

const tripsController = require('../controllers/trips');
const authController = require("../controllers/authentication");

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader == null) {
    console.log('Auth Header Required but NOT PRESENT!');
    return res.sendStatus(401);
  }

  let headers = authHeader.split(' ');

  if (headers.length < 1) {
    console.log('Not enough tokens in Auth Header: ' + headers.length);
    return res.sendStatus(501);
  }

  const token = authHeader.split(' ')[1];

  if (token == null) {
    console.log('Null Bearer Token');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
    if (err) {
      return res.sendStatus(401);
    }

    req.auth = verified;
    next();
  });
}

router
    .route("/register")
    .post(authController.register);

router
    .route("/login")
    .post(authController.login);

router
    .route('/trips')
    .get(tripsController.tripsList)
    .post(authenticateJWT, tripsController.tripsAddTrip);

router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindCode)
    .put(authenticateJWT, tripsController.tripsUpdateTrip);

module.exports = router;