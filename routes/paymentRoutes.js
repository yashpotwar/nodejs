// routes/paymentRoutes.js
const express = require('express');
const Razorpay = require('razorpay');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: 'rzp_test_w6yTL87tgJBK5e', // ✅ Replace with your test Key ID
  key_secret: 'fVBSbh3b8uLpfWp8wc4y2Zdn', // ✅ Replace with your test Key Secret
});

router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // in paisa
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Razorpay order creation failed' });
  }
});

module.exports = router;
