const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/OrderController'); // ❌ getOrderById hata do

router.post('/place', placeOrder);

// 🧹 HATA DO
// router.get('/:id', getOrderById);
// router.get('/orders/:id', getOrderById);

module.exports = router;
