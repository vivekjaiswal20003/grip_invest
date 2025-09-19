
/**
 * @file Centralized error handling middleware.
 * @module middlewares/error.middleware
 */

/**
 * A custom error class for handling "Not Found" errors (HTTP 404).
 * @class
 * @extends Error
 */
class NotFoundError extends Error {
  /**
   * Creates an instance of NotFoundError.
   * @param {string} [message='Resource not found'] - The error message.
   */
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

/**
 * A custom error class for handling "Bad Request" errors (HTTP 400).
 * @class
 * @extends Error
 */
class BadRequestError extends Error {
  /**
   * Creates an instance of BadRequestError.
   * @param {string} [message='Bad Request'] - The error message.
   */
  constructor(message = 'Bad Request') {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

/**
 * A custom error class for handling "Unauthorized" errors (HTTP 401).
 * @class
 * @extends Error
 */
class UnauthorizedError extends Error {
  /**
   * Creates an instance of UnauthorizedError.
   * @param {string} [message='Unauthorized'] - The error message.
   */
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

/**
 * Express middleware to handle errors in a centralized way.
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 server error if status code is not set
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // In development, send detailed error information
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR STACK:', err.stack);
    return res.status(statusCode).json({
      message,
      stack: err.stack,
    });
  }

  // In production, send a generic error message
  res.status(statusCode).json({
    message,
  });
};

/**
 * Middleware to handle 404 Not Found errors for routes that do not exist.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`The requested URL ${req.originalUrl} was not found on this server.`);
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
};
