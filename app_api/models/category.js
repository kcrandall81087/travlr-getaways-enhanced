const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required.'],
      unique: true,
      trim: true,
      maxlength: [
        50,
        'Category name cannot exceed 50 characters.'
      ]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        500,
        'Category description cannot exceed 500 characters.'
      ]
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model(
  'categories',
  categorySchema
);

module.exports = Category;