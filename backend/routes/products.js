const express = require('express');
const { listProducts, getProductById } = require('../utils/productRepository');
const { defaultProducts } = require('../data/defaultProducts');

const router = express.Router();

// Simple in-memory cache for lightweight products
let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

router.get('/', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (productsCache && now - productsCacheTime < CACHE_DURATION) {
      return res.json(productsCache);
    }
    const products = await listProducts(false); // lightweight by default
    // Update cache
    productsCache = products;
    productsCacheTime = now;
    return res.json(products);
  } catch (e) {
    console.error('[GET /api/products]', e);
    // Fallback to default products if DB fails
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
    // Fallback to default products if DB fails
    const product = defaultProducts.find(p => String(p.id) === String(req.params.id));
    if (product) {
      return res.json(product);
    }
    return res.status(404).json({ message: 'Product not found' });
  }
});

// Function to invalidate products cache (called from admin routes)
const invalidateProductsCache = () => {
  productsCache = null;
  productsCacheTime = 0;
};

module.exports = { router, invalidateProductsCache };
