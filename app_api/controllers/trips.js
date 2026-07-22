const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

require('../models/travlr');

const Trip = mongoose.model('trips');

/**
 * Escapes special regular-expression characters so search input
 * is treated as plain text.
 */
const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const tripsList = asyncHandler(async (req, res) => {
  const {
    search,
    sort,
    minPrice,
    maxPrice,
    duration,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  /*
   * Search trip names, resorts, and descriptions.
   */
  if (search && search.trim()) {
    const safeSearch = escapeRegex(search.trim());

    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { resort: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  /*
   * Validate the minimum-price filter.
   */
  let minimumPrice;

  if (minPrice !== undefined && minPrice !== '') {
    minimumPrice = Number(minPrice);

    if (!Number.isFinite(minimumPrice) || minimumPrice < 0) {
      throw new AppError(
        'Minimum price must be a nonnegative number.',
        400
      );
    }
  }

  /*
   * Validate the maximum-price filter.
   */
  let maximumPrice;

  if (maxPrice !== undefined && maxPrice !== '') {
    maximumPrice = Number(maxPrice);

    if (!Number.isFinite(maximumPrice) || maximumPrice < 0) {
      throw new AppError(
        'Maximum price must be a nonnegative number.',
        400
      );
    }
  }

  if (
    minimumPrice !== undefined &&
    maximumPrice !== undefined &&
    minimumPrice > maximumPrice
  ) {
    throw new AppError(
      'Minimum price cannot be greater than maximum price.',
      400
    );
  }

  /*
   * Convert the existing string-based perPerson field to a number
   * before applying price comparisons.
   */
  if (
    minimumPrice !== undefined ||
    maximumPrice !== undefined
  ) {
    const numericPriceExpression = {
      $convert: {
        input: '$perPerson',
        to: 'double',
        onError: null,
        onNull: null
      }
    };

    const priceConditions = [];

    if (minimumPrice !== undefined) {
      priceConditions.push({
        $gte: [
          numericPriceExpression,
          minimumPrice
        ]
      });
    }

    if (maximumPrice !== undefined) {
      priceConditions.push({
        $lte: [
          numericPriceExpression,
          maximumPrice
        ]
      });
    }

    query.$expr = {
      $and: priceConditions
    };
  }

  /*
   * Filter by the existing string-based duration field.
   *
   * Examples:
   * duration=4
   * duration=4 nights
   */
  if (duration && duration.trim()) {
    const safeDuration = escapeRegex(duration.trim());

    query.length = {
      $regex: safeDuration,
      $options: 'i'
    };
  }

  /*
   * Validate pagination values.
   */
  const pageNumber = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const limitNumber = Math.min(
    Math.max(parseInt(limit, 10) || 10, 1),
    100
  );

  const skip = (pageNumber - 1) * limitNumber;

  /*
   * Only approved fields may be used for sorting.
   */
  const allowedSortFields = [
    'name',
    'resort',
    'length',
    'perPerson'
  ];

  let requestedSortField = 'name';
  let sortDirection = 1;

  if (sort) {
    const field = sort.startsWith('-')
      ? sort.substring(1)
      : sort;

    if (allowedSortFields.includes(field)) {
      requestedSortField = field;
      sortDirection = sort.startsWith('-') ? -1 : 1;
    }
  }

  /*
   * Map string-based fields to temporary numeric fields so that
   * price and duration are sorted numerically.
   */
  const aggregationSortFields = {
    name: 'name',
    resort: 'resort',
    length: 'numericDuration',
    perPerson: 'numericPrice'
  };

  const aggregationSortField =
    aggregationSortFields[requestedSortField];

  const pipeline = [
    {
      $match: query
    },
    {
      $addFields: {
        /*
         * Convert values such as "799.00" to 799.
         */
        numericPrice: {
          $convert: {
            input: '$perPerson',
            to: 'double',
            onError: null,
            onNull: null
          }
        },

        /*
         * Extract the first number from values such as
         * "4 nights / 5 days" and convert it to 4.
         */
        numericDuration: {
          $convert: {
            input: {
              $arrayElemAt: [
                {
                  $split: [
                    '$length',
                    ' '
                  ]
                },
                0
              ]
            },
            to: 'int',
            onError: null,
            onNull: null
          }
        }
      }
    },
    {
      $sort: {
        [aggregationSortField]: sortDirection,
        _id: 1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limitNumber
    },
    {
      $project: {
        numericPrice: 0,
        numericDuration: 0
      }
    }
  ];

  const [trips, total] = await Promise.all([
    Trip.aggregate(pipeline),
    Trip.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  return res.status(200).json({
    trips,
    filters: {
      search: search?.trim() || null,
      minPrice: minimumPrice ?? null,
      maxPrice: maximumPrice ?? null,
      duration: duration?.trim() || null,
      sort: sort || null
    },
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages
    }
  });
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