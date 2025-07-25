const express = require('express');
const router = express.Router();
const { placeOrder, getOrderById } = require('../controllers/OrderController');


router.post('/place', placeOrder);
router.get('/:id', getOrderById);
router.get('/orders/:id', getOrderById);
module.exports = router;
