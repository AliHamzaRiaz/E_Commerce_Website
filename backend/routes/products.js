const express = require('express');
const { listProducts, getProductById } = require('../utils/productRepository');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await listProducts();
    const category = String(req.query?.category || '').trim();
    const onlyAvailable = products.filter((p) => p.available !== false);
    if (!category) return res.json(onlyAvailable);
    return res.json(onlyAvailable.filter((p) => String(p.category || '').toLowerCase() === category.toLowerCase()));
  } catch (e) {
    console.error('[GET /api/products]', e);
    const detail = process.env.NODE_ENV === 'production' ? undefined : e?.message;
    return res.status(500).json({ message: 'Failed to load products', ...(detail ? { detail } : {}) });
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
