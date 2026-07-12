const express = require('express');
const { listCategories, addCategory, deleteCategory, updateCategory, defaultCategories } = require('../utils/categoryRepository');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Simple in-memory cache for categories
let categoriesCache = null;
let categoriesCacheTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

// Public route to list categories
router.get('/', async (req, res) => {
  console.log('[GET /api/categories] Received request');
  try {
    // Check cache first
    const now = Date.now();
    if (categoriesCache && now - categoriesCacheTime < CACHE_DURATION) {
      return res.json(categoriesCache);
    }
    const categories = await listCategories();
    console.log('[GET /api/categories] Sending categories:', categories);
    // Update cache
    categoriesCache = categories;
    categoriesCacheTime = now;
    return res.json(categories);
  } catch (e) {
    console.error('[GET /api/categories]', e);
    // Fallback to default categories if DB fails
    return res.json(defaultCategories);
  }
});

// Admin protected routes
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, displayName, image, types } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and Display Name are required' });
    }
    const category = await addCategory({ name, displayName, image, types });
    res.status(201).json(category);
  } catch (e) {
    console.error('[POST /api/categories]', e);
    if (e.code === '23505') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Failed to create category' });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    console.log('[PUT /api/categories/:id] Incoming request:', { params: req.params, body: req.body });
    const { displayName, image, types } = req.body;
    const category = await updateCategory(req.params.id, { displayName, image, types });
    console.log('[PUT /api/categories/:id] Updated category:', category);
    res.json(category);
  } catch (e) {
    console.error('[PUT /api/categories/:id] Error:', e);
    res.status(500).json({ message: 'Failed to update category', error: e.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (e) {
    console.error('[DELETE /api/categories]', e);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

// Function to invalidate cache (called from admin routes)
const invalidateCategoriesCache = () => {
  categoriesCache = null;
  categoriesCacheTime = 0;
};

module.exports = { router, invalidateCategoriesCache };
