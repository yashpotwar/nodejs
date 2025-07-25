const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');


router.post('/add', cartController.addToCart);  // ✅ This is the POST you need
router.get('/:userId', cartController.getCartByUser);
router.put('/update/:id', cartController.updateCartItem);
router.delete('/delete/:id', cartController.deleteCartItem);



module.exports = router;
