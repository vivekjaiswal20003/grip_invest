const express = require('express');
const router = express.Router();
const { signup, login, getPasswordStrength, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validations/auth.validation');
const { handleValidationErrors } = require('../middlewares/validation.middleware');

// @route   POST api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signupValidation, handleValidationErrors, signup);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, login);

// @route   POST api/auth/forgot-password
// @desc    Send password reset OTP
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);

// @route   POST api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);

// @route   POST api/auth/password-strength
// @desc    Get password strength feedback from AI
// @access  Public
router.post('/password-strength', getPasswordStrength);

module.exports = router;
