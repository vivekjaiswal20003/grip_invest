const { User } = require('../../models');
const { asyncHandler } = require('../utils/controller.utils');
const { NotFoundError } = require('../middlewares/error.middleware');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res, next) => {
  // req.user is attached by the 'protect' middleware
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (user) {
    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      riskAppetite: user.riskAppetite,
      balance: user.balance,
      createdAt: user.createdAt,
    });
  } else {
    throw new NotFoundError('User not found');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.riskAppetite = req.body.riskAppetite || user.riskAppetite;

    // Add other fields you want to be updatable

    const updatedUser = await user.save();

    res.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      riskAppetite: updatedUser.riskAppetite,
    });
  } else {
    throw new NotFoundError('User not found');
  }
});

module.exports = { getProfile, updateProfile };
