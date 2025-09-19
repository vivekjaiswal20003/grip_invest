
const { Investment, InvestmentProduct } = require('../../models');

/**
 * @file Service layer for investment-related business logic.
 * @module services/investment.service
 */

/**
 * Retrieves the portfolio for a given user.
 *
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object>} An object containing the user's portfolio details.
 */
const getUserPortfolio = async (userId) => {
  const investments = await Investment.findAll({
    where: { userId },
    include: [
      {
        model: InvestmentProduct,
        as: 'product',
      },
    ],
  });

  const totalInvested = investments.reduce((acc, inv) => acc + parseFloat(inv.amount), 0);
  const totalExpectedReturn = investments.reduce((acc, inv) => acc + parseFloat(inv.expectedReturn), 0);

  return {
    totalInvested,
    totalExpectedReturn,
    numberOfInvestments: investments.length,
    investments,
  };
};

module.exports = { getUserPortfolio };
