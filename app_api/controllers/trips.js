const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

require('../models/travlr');

const Trip = mongoose.model('trips');

const tripsList = asyncHandler(async (req, res) => {
  const trips = await Trip.find({});

  return res.status(200).json(trips);
});

const tripsFindCode = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({
    code: req.params.tripCode
  });

  if (!trip) {
    throw new AppError(
      `Trip with code '${req.params.tripCode}' was not found.`,
      404
    );
  }

  return res.status(200).json(trip);
});

const tripsAddTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.create(req.validatedTrip);

  return res.status(201).json(trip);
});

const tripsUpdateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    {
      code: req.params.tripCode
    },
    req.validatedTrip,
    {
      new: true,
      runValidators: true
    }
  );

  if (!trip) {
    throw new AppError(
      `Trip with code '${req.params.tripCode}' was not found.`,
      404
    );
  }

  return res.status(200).json(trip);
});

module.exports = {
  tripsList,
  tripsFindCode,
  tripsAddTrip,
  tripsUpdateTrip
};