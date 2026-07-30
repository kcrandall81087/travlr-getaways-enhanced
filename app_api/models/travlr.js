const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Trip code is required.'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Trip code cannot exceed 20 characters.']
    },

    name: {
      type: String,
      required: [true, 'Trip name is required.'],
      trim: true,
      maxlength: [100, 'Trip name cannot exceed 100 characters.']
    },

    length: {
      type: String,
      required: [true, 'Trip length is required.'],
      trim: true,
      maxlength: [50, 'Trip length cannot exceed 50 characters.']
    },

    durationNights: {
      type: Number,
      required: [true, 'Trip duration is required.'],
      min: [1, 'Trip duration must be at least one night.'],
      max: [365, 'Trip duration cannot exceed 365 nights.']
    },

    start: {
      type: Date,
      required: [true, 'Trip start date is required.']
    },

    resort: {
      type: String,
      required: [true, 'Resort is required.'],
      trim: true,
      maxlength: [100, 'Resort cannot exceed 100 characters.']
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
      required: [true, 'Trip category is required.'],
      index: true
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      index: true
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0
    },

    perPerson: {
      type: Number,
      required: [true, 'Price per person is required.'],
      min: [0, 'Price per person cannot be negative.']
    },

    image: {
      type: String,
      required: [true, 'Trip image is required.'],
      trim: true,
      maxlength: [255, 'Image path cannot exceed 255 characters.']
    },

    description: {
      type: String,
      required: [true, 'Trip description is required.'],
      trim: true,
      maxlength: [
        2000,
        'Trip description cannot exceed 2,000 characters.'
      ]
    }
  },
  {
    timestamps: true
  }
);

/*
 * Support text searching across the primary customer-facing fields.
 */
tripSchema.index({
  name: 'text',
  resort: 'text',
  description: 'text'
});

/*
 * Support common filtering and sorting operations.
 */
tripSchema.index({ perPerson: 1 });
tripSchema.index({ durationNights: 1 });
tripSchema.index({ resort: 1, start: 1 });

const Trip = mongoose.model('trips', tripSchema);

module.exports = Trip;