const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');

// All routes in this file are protected
router.use(protect);

router.route('/profile').get(getProfile).put(updateProfile);

module.exports = router;
