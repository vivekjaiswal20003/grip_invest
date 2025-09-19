
const { body } = require('express-validator');

/**
 * @file Validation rules for authentication routes.
 * @module validations/auth.validation
 */

const signupValidation = [
  body('firstName').notEmpty().withMessage('First name is required.'),
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const forgotPasswordValidation = [body('email').isEmail().withMessage('Please provide a valid email address.')];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address.'),
  body('otp').notEmpty().withMessage('OTP is required.'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
];

module.exports = {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
