const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'trips',
      required: [true, 'A review must belong to a trip.'],
      index: true
    },

    reviewerName: {
      type: String,
      required: [true, 'Reviewer name is required.'],
      trim: true,
      maxlength: [
        100,
        'Reviewer name cannot exceed 100 characters.'
      ]
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number.'
      }
    },

    comment: {
      type: String,
      required: [true, 'Review comment is required.'],
      trim: true,
      maxlength: [
        2000,
        'Review comment cannot exceed 2,000 characters.'
      ]
    }
  },
  {
    timestamps: true
  }
);

/*
 * Support retrieving a trip's reviews by newest first.
 */
reviewSchema.index({
  trip: 1,
  createdAt: -1
});

/*
 * Support rating-based queries and reporting.
 */
reviewSchema.index({
  rating: -1
});

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;