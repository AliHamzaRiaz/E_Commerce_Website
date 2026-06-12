const express = require('express');
const { listCategories, addCategory, deleteCategory, updateCategory } = require('../utils/categoryRepository');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Fallback categories in case DB fails
const fallbackCategories = [
  { id: 1, name: 'bra', displayName: 'Bra' },
  { id: 2, name: 'underwear', displayName: 'Underwear' },
  { id: 3, name: 'nightwear', displayName: 'Nightwear' },
  { id: 4, name: 'activewear', displayName: 'Activewear' }
];

// Public route to list categories
router.get('/', async (req, res) => {
  console.log('[GET /api/categories] Received request');
  try {
    const categories = await listCategories();
    console.log('[GET /api/categories] Sending categories:', categories);
    return res.json(categories);
  } catch (e) {
    console.error('[GET /api/categories]', e);
    return res.status(500).json({ message: 'Failed to load categories' });
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

module.exports = router;
