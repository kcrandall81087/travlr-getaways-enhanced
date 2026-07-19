const apiNotFoundHandler = (req, res, next) => {
  const error = new Error(
    `API endpoint not found: ${req.method} ${req.originalUrl}`
  );

  error.statusCode = 404;
  next(error);
};

const apiErrorHandler = (err, req, res, next) => {
  console.error({
    message: err.message,
    method: req.method,
    path: req.originalUrl,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Unauthorized request.',
      error: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Database validation failed.',
      errors: Object.values(err.errors).map((validationError) => ({
        field: validationError.path,
        message: validationError.message
      }))
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      message: 'A record with that value already exists.',
      fields: Object.keys(err.keyValue || {})
    });
  }

  const statusCode = err.statusCode || err.status || 500;

  const response = {
    message:
      statusCode === 500
        ? 'An unexpected server error occurred.'
        : err.message
  };

  if (err.details) {
    response.errors = err.details;
  }

  if (
    process.env.NODE_ENV === 'development' &&
    statusCode === 500
  ) {
    response.error = err.message;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  apiNotFoundHandler,
  apiErrorHandler
};