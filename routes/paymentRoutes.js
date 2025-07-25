// server/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/checkout', paymentController.checkoutPayment);

module.exports = router;
