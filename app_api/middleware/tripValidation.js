const REQUIRED_TRIP_FIELDS = [
  'code',
  'name',
  'length',
  'start',
  'resort',
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

  req.validatedTrip = {
    ...tripData,
    start: startDate
  };

  next();
};

module.exports = {
  validateTrip
};