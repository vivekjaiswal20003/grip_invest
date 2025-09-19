
/**
 * @file Reusable utility functions for controllers.
 * @module utils/controller.utils
 */

/**
 * A utility function to wrap async route handlers and catch errors.
 * This avoids the need for a try-catch block in every async controller.
 *
 * @param {Function} fn - The async controller function to wrap.
 * @returns {Function} A new function that catches errors and passes them to next().
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
