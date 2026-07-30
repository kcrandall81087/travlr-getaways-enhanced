const REQUIRED_REVIEW_FIELDS = [
  'reviewerName',
  'rating',
  'comment'
];

const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '')
  );
};

const normalizeReviewPayload = (body = {}) => {
  const normalizedPayload = {};

  REQUIRED_REVIEW_FIELDS.forEach((field) => {
    const value = body[field];

    normalizedPayload[field] =
      typeof value === 'string' ? value.trim() : value;
  });

  return normalizedPayload;
};

const validateReview = (req, res, next) => {
  const reviewData = normalizeReviewPayload(req.body);

  const missingFields = REQUIRED_REVIEW_FIELDS.filter(
    (field) => isEmpty(reviewData[field])
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: 'Review validation failed.',
      errors: missingFields.map((field) => ({
        field,
        message: `${field} is required.`
      }))
    });
  }

  const numericRating = Number(reviewData.rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res.status(400).json({
      message: 'Review validation failed.',
      errors: [
        {
          field: 'rating',
          message:
            'rating must be a whole number between 1 and 5.'
        }
      ]
    });
  }

  if (reviewData.reviewerName.length > 100) {
    return res.status(400).json({
      message: 'Review validation failed.',
      errors: [
        {
          field: 'reviewerName',
          message:
            'reviewerName cannot exceed 100 characters.'
        }
      ]
    });
  }

  if (reviewData.comment.length > 2000) {
    return res.status(400).json({
      message: 'Review validation failed.',
      errors: [
        {
          field: 'comment',
          message:
            'comment cannot exceed 2,000 characters.'
        }
      ]
    });
  }

  req.validatedReview = {
    ...reviewData,
    rating: numericRating
  };

  next();
};

module.exports = {
  validateReview
};