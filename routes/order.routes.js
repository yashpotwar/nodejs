const express = require('express');
const router = express.Router();
const { placeOrder, getOrderById, getOrdersByUserId } = require('../controllers/OrderController');

router.post('/place', placeOrder);
router.get('/user/:userId', getOrdersByUserId);
router.get('/:id', getOrderById);

module.exports = router;
