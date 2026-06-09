const express = require('express');
const { listReviewsByProduct, addReview } = require('../utils/reviewRepository');

const router = express.Router();

// Get all reviews for a specific product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await listReviewsByProduct(req.params.productId);
    res.json(reviews);
  } catch (e) {
    console.error('[GET /api/reviews/:productId]', e);
    res.status(500).json({ message: 'Failed to load reviews' });
  }
});

// Add a new review
router.post('/', async (req, res) => {
  try {
    const { productId, userName, rating, comment } = req.body;
    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const review = await addReview({ productId, userName, rating, comment });
    res.status(201).json(review);
  } catch (e) {
    console.error('[POST /api/reviews]', e);
    res.status(500).json({ message: 'Failed to save review' });
  }
});

module.exports = router;
