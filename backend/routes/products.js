const express = require('express');
const { listProducts, getProductById } = require('../utils/productRepository');
const { defaultProducts } = require('../data/defaultProducts');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // TEMP: Always use default products for testing, ignore DB errors entirely
    console.log('=== RETURN DEFAULT PRODUCTS ===');
    return res.json(defaultProducts);
  } catch (e) {
    console.error('[GET /api/products]', e);
    return res.json(defaultProducts);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product || product.available === false) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to load product' });
  }
});

module.exports = router;
