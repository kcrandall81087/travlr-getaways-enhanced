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
   * Apply price filters directly to the normalized numeric field.
   */
  if (
    minimumPrice !== undefined ||
    maximumPrice !== undefined
  ) {
    query.perPerson = {};

    if (minimumPrice !== undefined) {
      query.perPerson.$gte = minimumPrice;
    }

    if (maximumPrice !== undefined) {
      query.perPerson.$lte = maximumPrice;
    }
  }

  /*
   * Filter by the normalized numeric trip duration.
   */
  let durationNumber;

  if (duration !== undefined && duration !== '') {
    durationNumber = Number(duration);

    if (
      !Number.isInteger(durationNumber) ||
      durationNumber <= 0
    ) {
      throw new AppError(
        'Duration must be a positive whole number.',
        400
      );
    }

    query.durationNights = durationNumber;
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
  * Map supported API sort values to database fields.
  *
  * The existing interfaces still submit "length", so it is mapped
  * to the normalized durationNights field for backward compatibility.
  */
  const allowedSortFields = {
    name: 'name',
    resort: 'resort',
    length: 'durationNights',
    durationNights: 'durationNights',
    perPerson: 'perPerson',
    start: 'start'
  };

  let requestedSortField = 'name';
  let sortDirection = 1;

  if (sort) {
    const descending = sort.startsWith('-');
    const requestedField = descending
      ? sort.substring(1)
      : sort;

    if (allowedSortFields[requestedField]) {
      requestedSortField =
        allowedSortFields[requestedField];

      sortDirection = descending ? -1 : 1;
    }
  }

  const sortOptions = {
    [requestedSortField]: sortDirection,
    _id: 1
  };

  /*
   * Query MongoDB directly using the normalized numeric fields.
   */
  const [trips, total] = await Promise.all([
    Trip.find(query)
      .populate('category', 'name description')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .lean(),

    Trip.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limitNumber);

  return res.status(200).json({
    trips,
    filters: {
      search: search?.trim() || null,
      minPrice: minimumPrice ?? null,
      maxPrice: maximumPrice ?? null,
      duration: durationNumber ?? null,
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
  }).populate('category', 'name description');

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

  await trip.populate('category', 'name description');

  return res.status(201).json(trip);
});

const tripsUpdateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    {
      code: req.params.tripCode
    },
    req.validatedTrip,
    {
      returnDocument: 'after',
      runValidators: true
    }
  );

  if (!trip) {
    throw new AppError(
      `Trip with code '${req.params.tripCode}' was not found.`,
      404
    );
  }

  await trip.populate('category', 'name description');

  return res.status(200).json(trip);
});

const tripsStats = asyncHandler(async (req, res) => {
  const [results] = await Trip.aggregate([
    {
      $facet: {
        /*
         * Overall statistics currently displayed by the dashboard.
         */
        overall: [
          {
            $group: {
              _id: null,

              tripCount: {
                $sum: 1
              },

              averagePrice: {
                $avg: '$perPerson'
              },

              lowestPrice: {
                $min: '$perPerson'
              },

              highestPrice: {
                $max: '$perPerson'
              },

              averageDuration: {
                $avg: '$durationNights'
              },

              shortestDuration: {
                $min: '$durationNights'
              },

              longestDuration: {
                $max: '$durationNights'
              },

              totalReviews: {
                $sum: {
                  $ifNull: ['$reviewCount', 0]
                }
              },

              reviewedTripCount: {
                $sum: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $ifNull: ['$reviewCount', 0]
                        },
                        0
                      ]
                    },
                    1,
                    0
                  ]
                }
              },

              weightedRatingTotal: {
                $sum: {
                  $multiply: [
                    {
                      $ifNull: ['$averageRating', 0]
                    },
                    {
                      $ifNull: ['$reviewCount', 0]
                    }
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,

              tripCount: 1,

              averagePrice: {
                $round: ['$averagePrice', 2]
              },

              lowestPrice: 1,
              highestPrice: 1,

              averageDuration: {
                $round: ['$averageDuration', 2]
              },

              shortestDuration: 1,
              longestDuration: 1,

              totalReviews: 1,
              reviewedTripCount: 1,

              averageRating: {
                $cond: [
                  {
                    $gt: ['$totalReviews', 0]
                  },
                  {
                    $round: [
                      {
                        $divide: [
                          '$weightedRatingTotal',
                          '$totalReviews'
                        ]
                      },
                      1
                    ]
                  },
                  0
                ]
              }
            }
          }
        ],

        /*
         * Return the three highest-rated trips that have
         * received at least one customer review.
         */
        highestRatedTrips: [
          {
            $match: {
              reviewCount: {
                $gt: 0
              }
            }
          },
          {
            $sort: {
              averageRating: -1,
              reviewCount: -1,
              name: 1
            }
          },
          {
            $limit: 3
          },
          {
            $project: {
              _id: 0,
              code: 1,
              name: 1,
              resort: 1,

              averageRating: {
                $round: [
                  {
                    $ifNull: ['$averageRating', 0]
                  },
                  1
                ]
              },

              reviewCount: {
                $ifNull: ['$reviewCount', 0]
              }
            }
          }
        ],

        /*
         * Return the three trips with the greatest number
         * of submitted customer reviews.
         */
        mostReviewedTrips: [
          {
            $match: {
              reviewCount: {
                $gt: 0
              }
            }
          },
          {
            $sort: {
              reviewCount: -1,
              averageRating: -1,
              name: 1
            }
          },
          {
            $limit: 3
          },
          {
            $project: {
              _id: 0,
              code: 1,
              name: 1,
              resort: 1,

              averageRating: {
                $round: [
                  {
                    $ifNull: ['$averageRating', 0]
                  },
                  1
                ]
              },

              reviewCount: {
                $ifNull: ['$reviewCount', 0]
              }
            }
          }
        ],

        /*
         * Join trips to their category records and calculate
         * statistics for each category.
         */
        categoryStatistics: [
          {
            $lookup: {
              from: 'categories',
              localField: 'category',
              foreignField: '_id',
              as: 'categoryDetails'
            }
          },
          {
            $unwind: {
              path: '$categoryDetails',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $group: {
              _id: '$category',

              categoryName: {
                $first: {
                  $ifNull: [
                    '$categoryDetails.name',
                    'Uncategorized'
                  ]
                }
              },

              tripCount: {
                $sum: 1
              },

              averagePrice: {
                $avg: '$perPerson'
              },

              lowestPrice: {
                $min: '$perPerson'
              },

              highestPrice: {
                $max: '$perPerson'
              },

              averageDuration: {
                $avg: '$durationNights'
              },

              totalReviews: {
                $sum: {
                  $ifNull: ['$reviewCount', 0]
                }
              },

              reviewedTripCount: {
                $sum: {
                  $cond: [
                    {
                      $gt: [
                        {
                          $ifNull: ['$reviewCount', 0]
                        },
                        0
                      ]
                    },
                    1,
                    0
                  ]
                }
              },

              weightedRatingTotal: {
                $sum: {
                  $multiply: [
                    {
                      $ifNull: ['$averageRating', 0]
                    },
                    {
                      $ifNull: ['$reviewCount', 0]
                    }
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0,

              categoryId: {
                $toString: '$_id'
              },

              categoryName: 1,
              tripCount: 1,

              averagePrice: {
                $round: ['$averagePrice', 2]
              },

              lowestPrice: 1,
              highestPrice: 1,

              averageDuration: {
                $round: ['$averageDuration', 2]
              },

              totalReviews: 1,
              reviewedTripCount: 1,

              averageRating: {
                $cond: [
                  {
                    $gt: ['$totalReviews', 0]
                  },
                  {
                    $round: [
                      {
                        $divide: [
                          '$weightedRatingTotal',
                          '$totalReviews'
                        ]
                      },
                      1
                    ]
                  },
                  0
                ]
              }
            }
          },
          {
            $sort: {
              categoryName: 1
            }
          }
        ]
      }
    }
  ]);

  const defaultOverallStatistics = {
    tripCount: 0,
    averagePrice: 0,
    lowestPrice: 0,
    highestPrice: 0,
    averageDuration: 0,
    shortestDuration: 0,
    longestDuration: 0,
    totalReviews: 0,
    reviewedTripCount: 0,
    averageRating: 0
  };

  const overallStatistics =
    results?.overall?.[0] || defaultOverallStatistics;

  return res.status(200).json({
    ...overallStatistics,
    highestRatedTrips:
      results?.highestRatedTrips || [],
    mostReviewedTrips:
      results?.mostReviewedTrips || [],
    categoryStatistics:
      results?.categoryStatistics || []
  });
});

module.exports = {
  tripsList,
  tripsStats,
  tripsFindCode,
  tripsAddTrip,
  tripsUpdateTrip
};