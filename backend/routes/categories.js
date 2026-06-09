const express = require('express');
const { listCategories, addCategory, deleteCategory, updateCategory } = require('../utils/categoryRepository');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public route to list categories
router.get('/', async (req, res) => {
  try {
    console.log('[GET /api/categories] Fetching categories...');
    const categories = await listCategories();
    console.log('[GET /api/categories] Found:', categories.length);
    res.json(categories);
  } catch (e) {
    console.error('[GET /api/categories]', e);
    res.status(500).json({ message: 'Failed to load categories' });
  }
});

// Admin protected routes
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, displayName, image } = req.body;
    if (!name || !displayName) {
      return res.status(400).json({ message: 'Name and Display Name are required' });
    }
    const category = await addCategory({ name, displayName, image });
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
    const { displayName, image } = req.body;
    const category = await updateCategory(req.params.id, { displayName, image });
    res.json(category);
  } catch (e) {
    console.error('[PUT /api/categories]', e);
    res.status(500).json({ message: 'Failed to update category' });
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

module.exports = router;
