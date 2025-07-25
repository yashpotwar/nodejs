const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Review related
router.post('/:productId/reviews', reviewController.submitReview);
router.get('/:productId/reviews', reviewController.getApprovedReviews);

// Admin
router.get('/admin/reviews/pending', reviewController.getPendingReviews);
router.put('/admin/reviews/approve/:id', reviewController.approveReview);
router.put('/admin/reviews/reject/:id', reviewController.rejectReview);

module.exports = router;
