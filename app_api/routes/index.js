const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // enable JSON web tokens

const tripsController = require('../controllers/trips');
const categoriesController = require('../controllers/categories');
const authController = require("../controllers/authentication");
const { validateTrip } = require('../middleware/tripValidation');
const reviewsController = require('../controllers/reviews');
const {
  validateReview
} = require('../middleware/reviewValidation');

// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.warn('Authorization header is missing.');
    return res
      .status(401)
      .json({ message: 'Authorization header is required.' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    console.warn('Authorization header is not in Bearer token format.');
    return res
      .status(401)
      .json({ message: 'A valid Bearer token is required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
    if (err) {
      console.warn(`JWT verification failed: ${err.message}`);
      return res
        .status(401)
        .json({ message: 'Authentication token is invalid or expired.' });
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
  .post(
    authenticateJWT,
    validateTrip,
    tripsController.tripsAddTrip
  );

router
  .route('/trips/stats')
  .get(tripsController.tripsStats);

router
  .route('/categories')
  .get(categoriesController.categoriesList);

router
  .route('/trips/:tripCode')
  .get(tripsController.tripsFindCode)
  .put(
    authenticateJWT,
    validateTrip,
    tripsController.tripsUpdateTrip
  );

router
  .route('/trips/:tripCode/reviews')
  .get(reviewsController.reviewsListByTrip)
  .post(
    validateReview,
    reviewsController.reviewsAddReview
  );

module.exports = router;