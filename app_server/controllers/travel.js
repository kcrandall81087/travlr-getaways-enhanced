/* GET travel page */
const travel = async (req, res) => {
  const apiBaseUrl = `${req.protocol}://${req.get('host')}/api`;
  const {
    search = '',
    sort = 'name',
    minPrice = '',
    maxPrice = '',
    duration = '',
    page = '1'
  } = req.query;

  const params = new URLSearchParams({
    sort,
    page,
    limit: '6'
  });

  if (search.trim()) {
    params.set('search', search.trim());
  }

  if (minPrice !== '') {
    params.set('minPrice', minPrice);
  }

  if (maxPrice !== '') {
    params.set('maxPrice', maxPrice);
  }

  if (duration.trim()) {
    params.set('duration', duration.trim());
  }

  const url = `${apiBaseUrl}/trips?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        `Trip API request failed with status ${response.status}`
      );
    }

    const trips = Array.isArray(data.trips)
      ? data.trips.map((trip) => {
          const rating = Math.min(
            Math.max(trip.averageRating ?? 0, 0),
            5
          );

          const roundedRating = Math.round(rating);
          const fullStars = '★'.repeat(roundedRating);
          const emptyStars = '☆'.repeat(5 - roundedRating);

          return {
            ...trip,
            ratingStars: `${fullStars}${emptyStars}`,
            hasReviews: (trip.reviewCount ?? 0) > 0,
            formattedAverageRating: rating.toFixed(1)
          };
        })
      : [];

    const pagination = data.pagination ?? {
      page: 1,
      limit: 6,
      total: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false
    };

    const hasActiveFilters =
      Boolean(search.trim()) ||
      minPrice !== '' ||
      maxPrice !== '' ||
      Boolean(duration.trim()) ||
      sort !== 'name';

    let message = null;

    if (!Array.isArray(data.trips)) {
      message = 'API lookup error';
    } else if (!trips.length && hasActiveFilters) {
      message = 'No trips matched your current filters';
    } else if (!trips.length) {
      message = 'No trips exist in our database';
    }

    res.render('travel', {
      title: 'Travel',
      trips,
      pagination,
      message,

      search,
      sort,
      minPrice,
      maxPrice,
      duration,

      hasActiveFilters,

      previousPage: pagination.hasPreviousPage
        ? pagination.page - 1
        : null,

      nextPage: pagination.hasNextPage
        ? pagination.page + 1
        : null,

      showPagination: pagination.totalPages > 1
    });
  } catch (err) {
    console.error('Unable to load travel page:', err);

    res.status(500).render('travel', {
      title: 'Travel',
      trips: [],
      pagination: null,
      message:
        err.message ||
        'Travel packages are temporarily unavailable',

      search,
      sort,
      minPrice,
      maxPrice,
      duration,

      hasActiveFilters:
        Boolean(search.trim()) ||
        minPrice !== '' ||
        maxPrice !== '' ||
        Boolean(duration.trim()) ||
        sort !== 'name',

      previousPage: null,
      nextPage: null,
      showPagination: false
    });
  }
};

/* GET individual trip details page */
const tripDetails = async (req, res) => {
  const { tripCode } = req.params;
  const apiBaseUrl = `${req.protocol}://${req.get('host')}/api`;

  const tripUrl =
    `${apiBaseUrl}/trips/${encodeURIComponent(tripCode)}`;

  const reviewsUrl =
    `${apiBaseUrl}/trips/${encodeURIComponent(tripCode)}/reviews`;

  try {
    const [tripResponse, reviewsResponse] =
      await Promise.all([
        fetch(tripUrl),
        fetch(reviewsUrl)
      ]);

    const trip = await tripResponse.json();
    const reviewsData = await reviewsResponse.json();

    if (!tripResponse.ok) {
      throw new Error(
        trip.message ||
        `Trip API request failed with status ${tripResponse.status}`
      );
    }

    if (!reviewsResponse.ok) {
      throw new Error(
        reviewsData.message ||
        `Reviews API request failed with status ${reviewsResponse.status}`
      );
    }

    const reviews = Array.isArray(reviewsData)
      ? reviewsData.map((review) => {
          const rating = Math.min(
            Math.max(review.rating ?? 0, 0),
            5
          );

          return {
            ...review,
            ratingStars:
              '★'.repeat(rating) +
              '☆'.repeat(5 - rating),
            formattedDate: new Date(
              review.createdAt
            ).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };
        })
      : [];

    const averageRating = Math.min(
      Math.max(trip.averageRating ?? 0, 0),
      5
    );

    const roundedRating = Math.round(averageRating);

    res.render('trip-details', {
      title: `${trip.name} - Trip Details`,
      trip: {
        ...trip,
        ratingStars:
          '★'.repeat(roundedRating) +
          '☆'.repeat(5 - roundedRating),
        formattedAverageRating:
          averageRating.toFixed(1),
        hasReviews: (trip.reviewCount ?? 0) > 0
      },
      reviews
    });
  } catch (err) {
    console.error(
      `Unable to load trip ${tripCode}:`,
      err
    );

    res.status(500).render('trip-details', {
      title: 'Trip Details',
      trip: null,
      reviews: [],
      message:
        err.message ||
        'Trip details are temporarily unavailable.'
    });
  }
};

module.exports = {
  travel,
  tripDetails
};