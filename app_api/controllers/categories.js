const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

require('../models/category');

const Category = mongoose.model('categories');

const categoriesList = asyncHandler(async (req, res) => {
  const categories = await Category.find({})
    .sort({ name: 1 })
    .lean();

  return res.status(200).json(categories);
});

module.exports = {
  categoriesList
};