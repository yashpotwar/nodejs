const express = require('express');
const router = express.Router();
const { getReports, getDeletedProductLogs } = require('../controllers/reportController');

// 🔹 Route to get purchase reports
router.get('/', getReports);

// 🔹 Route to get deleted product logs
router.get('/deleted', getDeletedProductLogs);

module.exports = router;
