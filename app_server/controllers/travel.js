/* GET travel page */
const travel = async (req, res) => {
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

  const url = `http://localhost:3000/api/trips?${params.toString()}`;

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
      ? data.trips
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

module.exports = {
  travel
};