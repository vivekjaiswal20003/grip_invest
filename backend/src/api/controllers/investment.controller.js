const { Investment, InvestmentProduct, User, sequelize } = require('../../models');
const { getPortfolioRiskSummary } = require('../../services/ai.service');
const { getUserPortfolio } = require('../services/investment.service');
const { asyncHandler } = require('../utils/controller.utils');
const { NotFoundError, BadRequestError } = require('../middlewares/error.middleware');

/**
 * @desc    Create a new investment
 * @route   POST /api/investments
 * @access  Private
 */
const createInvestment = asyncHandler(async (req, res, next) => {
  const { productId, amount } = req.body;
  const userId = req.user.id;
  const investmentAmount = parseFloat(amount);

  if (isNaN(investmentAmount) || investmentAmount <= 0) {
    throw new BadRequestError('Invalid investment amount.');
  }

  const t = await sequelize.transaction();

  try {
    const product = await InvestmentProduct.findByPk(productId, { transaction: t });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const user = await User.findByPk(userId, { transaction: t });
    if (user.balance < investmentAmount) {
      throw new BadRequestError('Insufficient balance');
    }

    if (product.minInvestment && investmentAmount < product.minInvestment) {
      throw new BadRequestError(`Investment amount must be at least ${product.minInvestment}`);
    }
    if (product.maxInvestment && investmentAmount > product.maxInvestment) {
      throw new BadRequestError(`Investment amount cannot exceed ${product.maxInvestment}`);
    }

    user.balance -= investmentAmount;
    await user.save({ transaction: t });

    const tenureInYears = product.tenureMonths / 12;
    const expectedReturn = investmentAmount * (1 + (product.annualYield / 100) * tenureInYears);
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + product.tenureMonths);

    const investment = await Investment.create({
      userId,
      productId,
      amount: investmentAmount,
      expectedReturn,
      maturityDate,
    }, { transaction: t });

    await t.commit();
    res.status(201).json(investment);
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

/**
 * @desc    Get user's portfolio
 * @route   GET /api/investments
 * @access  Private
 */
const getPortfolio = asyncHandler(async (req, res, next) => {
  const portfolio = await getUserPortfolio(req.user.id);
  res.json(portfolio);
});

/**
 * @desc    Get AI-powered portfolio risk summary
 * @route   GET /api/investments/summary
 * @access  Private
 */
const getPortfolioSummary = asyncHandler(async (req, res, next) => {
  const portfolio = await getUserPortfolio(req.user.id);

  const portfolioData = {
    ...portfolio,
    investments: portfolio.investments.map(inv => ({
      amount: parseFloat(inv.amount),
      product: {
        name: inv.product.name,
        investmentType: inv.product.investmentType,
        riskLevel: inv.product.riskLevel,
      }
    })),
  };

  try {
    const summary = await getPortfolioRiskSummary(portfolioData);
    res.json({ summary });
  } catch (aiError) {
    console.error(`AI portfolio summary failed for user ${req.user.id}:`, aiError.message);
    res.json({ summary: "AI-powered risk summary is currently unavailable." });
  }
});

module.exports = { createInvestment, getPortfolio, getPortfolioSummary };
