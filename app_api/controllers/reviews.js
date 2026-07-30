const mongoose = require('mongoose');

const Review = require('../models/review');
const Trip = require('../models/travlr');

const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const updateTripRatingSummary = async (tripId) => {
  const ratingSummary = await Review.aggregate([
    {
      $match: {
        trip: new mongoose.Types.ObjectId(tripId)
      }
    },
    {
      $group: {
        _id: '$trip',
        averageRating: {
          $avg: '$rating'
        },
        reviewCount: {
          $sum: 1
        }
      }
    }
  ]);

  const summary = ratingSummary[0] ?? {
    averageRating: 0,
    reviewCount: 0
  };

  return Trip.findByIdAndUpdate(
    tripId,
    {
      averageRating:
        Math.round(summary.averageRating * 10) / 10,
      reviewCount: summary.reviewCount
    },
    {
      returnDocument: 'after',
      runValidators: true
    }
  );
};

const reviewsListByTrip = asyncHandler(
  async (req, res) => {
    const trip = await Trip.findOne({
      code: req.params.tripCode
    });

    if (!trip) {
      throw new AppError(
        `Trip with code ${req.params.tripCode} was not found.`,
        404
      );
    }

    const reviews = await Review.find({
      trip: trip._id
    }).sort({
      createdAt: -1
    });

    return res.status(200).json(reviews);
  }
);

const reviewsAddReview = asyncHandler(
  async (req, res) => {
    const trip = await Trip.findOne({
      code: req.params.tripCode
    });

    if (!trip) {
      throw new AppError(
        `Trip with code ${req.params.tripCode} was not found.`,
        404
      );
    }

    const review = await Review.create({
      trip: trip._id,
      ...req.validatedReview
    });

    const updatedTrip =
      await updateTripRatingSummary(trip._id);

    return res.status(201).json({
      review,
      ratingSummary: {
        averageRating: updatedTrip.averageRating,
        reviewCount: updatedTrip.reviewCount
      }
    });
  }
);

module.exports = {
  reviewsListByTrip,
  reviewsAddReview
};