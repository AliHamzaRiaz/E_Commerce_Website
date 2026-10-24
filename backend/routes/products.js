const express = require('express');
const { listProducts, getProductById } = require('../utils/productRepository');
const { defaultProducts } = require('../data/defaultProducts');

const router = express.Router();

// In-memory cache — long enough for smooth 2–3s browse, invalidated on admin writes
let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = Number(process.env.PRODUCTS_CACHE_MS || 180000); // 3 minutes

router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    if (productsCache && now - productsCacheTime < CACHE_DURATION) {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      res.setHeader('X-Products-Cache', 'HIT');
      return res.json(productsCache);
    }
    const started = Date.now();
    const products = await listProducts(false); // lightweight by default
    productsCache = products;
    productsCacheTime = now;
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.setHeader('X-Products-Cache', 'MISS');
    res.setHeader('X-Products-Ms', String(Date.now() - started));
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
