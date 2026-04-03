const AppError = require('../utils/AppError');

/**
 * Global error handler middleware.
 * Converts known error types to structured JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // ─── Mongoose: CastError (invalid ObjectId) ───────────────────────────────
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // ─── Mongoose: Duplicate Key ──────────────────────────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = new AppError(`Duplicate value for field '${field}': "${value}" already exists.`, 409);
  }

  // ─── Mongoose: Validation Error ───────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new AppError(`Validation failed: ${messages.join('. ')}`, 400);
  }

  // ─── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  // ─── Development vs Production Response ───────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
      error: err,
    });
  }

  // Production: don't leak stack traces
  return res.status(error.statusCode).json({
    success: false,
    message: error.isOperational ? error.message : 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;
