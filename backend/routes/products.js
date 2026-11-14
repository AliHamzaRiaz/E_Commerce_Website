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
    // Prefer available products on the storefront; if all are hidden, still return them
    // so newly added items are never "invisible" after an accidental hide toggle.
    const list = Array.isArray(products) ? products : [];
    const visible = list.filter((p) => p && p.available !== false);
    const payload = visible.length ? visible : list;
    productsCache = payload;
    productsCacheTime = now;
    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    res.setHeader('X-Products-Cache', 'MISS');
    res.setHeader('X-Products-Ms', String(Date.now() - started));
    return res.json(payload);
  } catch (e) {
    console.error('[GET /api/products]', e);
    // Fallback to default products if DB fails
    return res.json(defaultProducts);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rawId = decodeURIComponent(String(req.params.id || '').trim());
    const product = await getProductById(rawId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Always return the product page for existing items (out-of-stock still viewable)
    res.json(product);
  } catch (e) {
    console.error(e);
    const rawId = decodeURIComponent(String(req.params.id || '').trim());
    const product = defaultProducts.find((p) => String(p.id) === String(rawId));
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
