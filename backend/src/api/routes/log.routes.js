const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/log.controller');
const { protect } = require('../middlewares/auth.middleware');
const { admin } = require('../middlewares/admin.middleware');

// All routes in this file are protected and admin-only
router.use(protect, admin);

router.route('/').get(getLogs);

module.exports = router;
