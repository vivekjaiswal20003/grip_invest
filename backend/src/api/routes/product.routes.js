const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendedProducts,
} = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// Public routes
router.route('/').get(getProducts);

// Protected routes
router.route('/recommendations').get(protect, getRecommendedProducts);

// Public routes
router.route('/:id').get(getProductById);

// Admin-only routes
router.route('/').post(protect, admin, createProduct);
router.route('/:id').put(protect, admin, updateProduct);
router.route('/:id').delete(protect, admin, deleteProduct);

module.exports = router;
