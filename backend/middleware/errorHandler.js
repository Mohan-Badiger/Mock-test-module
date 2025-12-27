// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // Database errors
  if (err.code === '28P01' || err.message?.includes('password authentication failed')) {
    statusCode = 503;
    message = 'Database authentication failed';
    details = process.env.NODE_ENV === 'development' ? err.message : 'Database connection error';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection refused';
    details = process.env.NODE_ENV === 'development' ? err.message : 'Database unavailable';
  } else if (err.code === '23505') { // Unique violation
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') { // Foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
  } else if (err.code === '23502') { // Not null violation
    statusCode = 400;
    message = 'Required field is missing';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = err.details;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    details = null;
  } else if (process.env.NODE_ENV === 'development') {
    details = err.stack;
  }

  res.status(statusCode).json({
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

