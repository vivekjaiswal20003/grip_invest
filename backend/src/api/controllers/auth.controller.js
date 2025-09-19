const { User, Otp } = require('../../models');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../../config/mailer');
const crypto = require('crypto');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../middlewares/error.middleware');
const { checkPasswordStrength } = require('../../services/ai.service');
const { asyncHandler } = require('../utils/controller.utils');

/**
 * Generates a JWT for a given user.
 * @param {object} user - The user object.
 * @returns {string} The generated JWT.
 */
const generateToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Handles user signup.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, riskAppetite } = req.body;

  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    throw new BadRequestError('User with this email already exists.');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    passwordHash: password, // The model hook will hash this
    riskAppetite,
    isAdmin: false, // Ensure isAdmin is always false on signup
  });

  res.status(201).json({
    id: user.id,
    firstName: user.firstName,
    email: user.email,
    message: 'Signup successful',
  });
});

/**
 * Handles user login.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user && (await user.comparePassword(password))) {
    res.json({
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  } else {
    throw new UnauthorizedError('Invalid email or password.');
  }
});

/**
 * Handles forgot password request.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('User with that email not found.');
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await Otp.create({
    otp,
    userId: user.id,
    expiresAt,
  });

  await sendOtpEmail(user.email, otp);

  res.status(200).json({ message: 'OTP sent to your email.' });
});

/**
 * Handles reset password request.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const otpRecord = await Otp.findOne({
    where: {
      userId: user.id,
      otp,
    },
  });

  if (!otpRecord) {
    throw new BadRequestError('Invalid OTP.');
  }

  if (otpRecord.expiresAt < new Date()) {
    await otpRecord.destroy();
    throw new BadRequestError('OTP has expired.');
  }

  user.passwordHash = password; // Hook will hash it
  await user.save();

  await otpRecord.destroy();

  res.status(200).json({ message: 'Password reset successfully.' });
});

/**
 * Gets password strength feedback from AI service.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 */
const getPasswordStrength = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const strengthFeedback = await checkPasswordStrength(password);
  res.json({ strength: strengthFeedback });
});

module.exports = { signup, login, getPasswordStrength, forgotPassword, resetPassword };
