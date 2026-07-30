var express = require('express');
var router = express.Router();
var ctrlTravel = require('../controllers/travel');

/* GET travel page */
router.get('/', ctrlTravel.travel);

/* GET individual trip details page */
router.get('/:tripCode', ctrlTravel.tripDetails);

module.exports = router;