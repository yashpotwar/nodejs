const express = require('express');
const router = express.Router();
const { getDeletedProductLogs } = require('../controllers/reportController');

// 🔹 Route to fetch only deleted product/cart logs
router.get('/', getDeletedProductLogs);

module.exports = router;
