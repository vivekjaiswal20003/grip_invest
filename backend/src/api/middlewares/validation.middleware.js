
const { validationResult } = require('express-validator');
const { BadRequestError } = require('./error.middleware');

/**
 * @file Middleware to handle validation errors from express-validator.
 * @module middlewares/validation.middleware
 */

/**
 * Middleware to check for validation errors and pass them to the error handler.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next(new BadRequestError(errorMessages.join(', ')));
  }
  next();
};

module.exports = { handleValidationErrors };
