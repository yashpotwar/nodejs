const express = require('express');
const router = express.Router();
const { getDashboardMetrics } = require('../controllers/dashboardController');

// GET /api/dashboard-metrics
router.get('/', getDashboardMetrics);

module.exports = router;
