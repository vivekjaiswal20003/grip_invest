const express = require('express');
const router = express.Router();
const {
  createInvestment,
  getPortfolio,
  getPortfolioSummary,
} = require('../controllers/investment.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes in this file are protected
router.use(protect);

router.route('/').post(createInvestment).get(getPortfolio);
router.route('/summary').get(getPortfolioSummary);

module.exports = router;
