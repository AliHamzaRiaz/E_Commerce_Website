const express = require('express');
const { listReviewsByProduct, listAllReviews, addReview, defaultReviews } = require('../utils/reviewRepository');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const reviewPostLimit = createRateLimit({
  windowMs: 15 * 60_000,
  max: 20,
  message: 'Too many reviews from this network. Please try again later.',
});

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await listAllReviews();
    res.json(reviews);
  } catch (e) {
    console.error('[GET /api/reviews]', e);
    res.json(defaultReviews);
  }
});

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

// Add a new review (no captcha — rate limited only)
router.post('/', reviewPostLimit, async (req, res) => {
  try {
    const { productId, userName, rating, comment } = req.body || {};
    if (!productId || !comment) {
      return res.status(400).json({ message: 'Product and comment are required' });
    }
    const review = await addReview({
      productId,
      userName: userName || 'Guest',
      rating,
      comment,
    });
    return res.status(201).json(review);
  } catch (e) {
    console.error('[POST /api/reviews]', e);
    if (e.message === 'PRODUCT_ID_REQUIRED' || e.message === 'COMMENT_REQUIRED') {
      return res.status(400).json({ message: 'Product and comment are required' });
    }
    return res.status(500).json({ message: 'Failed to save review' });
  }
});

module.exports = router;
