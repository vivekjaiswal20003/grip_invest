const { InvestmentProduct, User, Investment } = require('../../models');
const { generateProductDescription, getProductRecommendations } = require('../../services/ai.service');
const { asyncHandler } = require('../utils/controller.utils');
const { NotFoundError } = require('../middlewares/error.middleware');

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res, next) => {
  const products = await InvestmentProduct.findAll({});
  res.json(products);
});

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res, next) => {
  let {
    name,
    investmentType,
    tenureMonths,
    annualYield,
    riskLevel,
    minInvestment,
    maxInvestment,
    description,
  } = req.body;

  if (!description) {
    description = await generateProductDescription({
      name,
      investmentType,
      tenureMonths,
      annualYield,
      riskLevel,
    });
  }

  const product = await InvestmentProduct.create({
    name,
    investmentType,
    tenureMonths,
    annualYield,
    riskLevel,
    minInvestment,
    maxInvestment,
    description,
  });

  res.status(201).json(product);
});

/**
 * @desc    Get a product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = asyncHandler(async (req, res, next) => {
  const product = await InvestmentProduct.findByPk(req.params.id);

  if (product) {
    res.json(product);
  } else {
    throw new NotFoundError('Product not found');
  }
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    investmentType,
    tenureMonths,
    annualYield,
    riskLevel,
    minInvestment,
    maxInvestment,
  } = req.body;
  let { description } = req.body;

  const product = await InvestmentProduct.findByPk(req.params.id);

  if (!product) {
    throw new NotFoundError('Product not found');
  }

  if (!description && (name || investmentType || tenureMonths || annualYield || riskLevel)) {
    description = await generateProductDescription({
      name: name || product.name,
      investmentType: investmentType || product.investmentType,
      tenureMonths: tenureMonths || product.tenureMonths,
      annualYield: annualYield || product.annualYield,
      riskLevel: riskLevel || product.riskLevel,
    });
  }

  product.set({
    name: name || product.name,
    investmentType: investmentType || product.investmentType,
    tenureMonths: tenureMonths || product.tenureMonths,
    annualYield: annualYield || product.annualYield,
    riskLevel: riskLevel || product.riskLevel,
    minInvestment: minInvestment || product.minInvestment,
    maxInvestment: maxInvestment || product.maxInvestment,
    description: description || product.description,
  });

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await InvestmentProduct.findByPk(req.params.id);

  if (product) {
    await product.destroy();
    res.json({ message: 'Product removed' });
  } else {
    throw new NotFoundError('Product not found');
  }
});

/**
 * @desc    Get recommended products for a user
 * @route   GET /api/products/recommendations
 * @access  Private
 */
const getRecommendedProducts = asyncHandler(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const userInvestments = await Investment.findAll({
    where: { userId: user.id },
    include: [{ model: InvestmentProduct, as: 'product' }],
  });

  const allProducts = await InvestmentProduct.findAll({});

  const recommendations = await getProductRecommendations(user.riskAppetite, allProducts, userInvestments);
  res.json({ recommendations });
});

module.exports = { getProducts, createProduct, getProductById, updateProduct, deleteProduct, getRecommendedProducts };
