const REQUIRED_TRIP_FIELDS = [
  'code',
  'name',
  'length',
  'start',
  'resort',
  'category',
  'perPerson',
  'image',
  'description'
];

const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  );
};

const normalizeTripPayload = (body = {}) => {
  const normalizedPayload = {};

  REQUIRED_TRIP_FIELDS.forEach((field) => {
    const value = body[field];

    normalizedPayload[field] =
      typeof value === 'string' ? value.trim() : value;
  });

  return normalizedPayload;
};

const parseDurationNights = (length) => {
  if (typeof length !== 'string') {
    return null;
  }

  const match = length.match(/^(\d+)/);

  if (!match) {
    return null;
  }

  const duration = Number(match[1]);

  return Number.isInteger(duration) && duration > 0
    ? duration
    : null;
};

const validateTrip = (req, res, next) => {
  const tripData = normalizeTripPayload(req.body);

  const missingFields = REQUIRED_TRIP_FIELDS.filter(
    (field) => isEmpty(tripData[field])
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Trip validation failed.',
      errors: missingFields.map((field) => ({
        field,
        message: `${field} is required.`
      }))
    });
  }

  const startDate = new Date(tripData.start);

  if (Number.isNaN(startDate.getTime())) {
    return res.status(400).json({
      message: 'Trip validation failed.',
      errors: [
        {
          field: 'start',
          message: 'start must contain a valid date.'
        }
      ]
    });
  }

  const numericPrice = Number(tripData.perPerson);

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      message: 'Trip validation failed.',
      errors: [
        {
          field: 'perPerson',
          message:
            'perPerson must contain a nonnegative number.'
        }
      ]
    });
  }

  const durationNights =
    parseDurationNights(tripData.length);

  if (durationNights === null) {
    return res.status(400).json({
      message: 'Trip validation failed.',
      errors: [
        {
          field: 'length',
          message:
            'length must begin with a positive number of nights.'
        }
      ]
    });
  }

  req.validatedTrip = {
    ...tripData,
    code: tripData.code.toUpperCase(),
    start: startDate,
    perPerson: numericPrice,
    durationNights
  };

  next();
};

module.exports = {
  validateTrip
};