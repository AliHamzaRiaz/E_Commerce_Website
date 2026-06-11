const express = require('express');
const cors = require('cors');
const productRoutes = require('../backend/routes/products');
const orderRoutes = require('../backend/routes/orders');
const adminRoutes = require('../backend/routes/admin');
const userRoutes = require('../backend/routes/users');
const categoryRoutes = require('../backend/routes/categories');
const reviewRoutes = require('../backend/routes/reviews');
const { initProductsDb } = require('../backend/utils/productRepository');
const { initOrdersDb } = require('../backend/utils/orderRepository');
const { initUsersTable } = require('../backend/utils/userRepository');
const { initCategoriesTable } = require('../backend/utils/categoryRepository');
const { initReviewsTable } = require('../backend/utils/reviewRepository');
const { defaultProducts } = require('../backend/data/defaultProducts');

const app = express();

// Fallback categories and products in case DB fails
const fallbackCategories = [
  { id: 1, name: 'bra', displayName: 'Bra' },
  { id: 2, name: 'underwear', displayName: 'Underwear' },
  { id: 3, name: 'nightwear', displayName: 'Nightwear' },
  { id: 4, name: 'activewear', displayName: 'Activewear' }
];

// Initialize database connection
let dbInitialized = false;
const initializeDb = async () => {
  if (dbInitialized) return;
  try {
    await initProductsDb(defaultProducts);
    console.log('Products database ready');
  } catch (err) {
    console.warn('[startup] Products DB init failed:', err?.message || err);
  }
  try {
    await initOrdersDb();
    console.log('Orders database ready');
  } catch (err) {
    console.warn('[startup] Orders DB init failed:', err?.message || err);
  }
  try {
    await initUsersTable();
    console.log('Users database ready');
  } catch (err) {
    console.warn('[startup] Users DB init failed:', err?.message || err);
  }
  try {
    await initCategoriesTable();
    console.log('Categories database ready');
  } catch (err) {
    console.warn('[startup] Categories DB init failed:', err?.message || err);
  }
  try {
    await initReviewsTable();
    console.log('Reviews database ready');
  } catch (err) {
    console.warn('[startup] Reviews DB init failed:', err?.message || err);
  }
  dbInitialized = true;
};

// Middleware
app.use(cors());
app.options(/.*/, cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    hasDatabase: false
  };

  try {
    const { getPool } = require('../backend/utils/productRepository');
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    healthCheck.hasDatabase = true;
    healthCheck.dbTime = result.rows[0].now;
  } catch (e) {
    healthCheck.dbError = e.message;
    console.error('Database connection check failed:', e);
  }

  res.json(healthCheck);
});

// Routes with fallback
app.use('/api/products', (req, res, next) => {
  // Wrap to catch DB errors and fall back
  const originalSend = res.json;
  res.json = function(data) {
    return originalSend.call(this, data);
  };
  
  productRoutes(req, res, async (err) => {
    if (err) {
      console.log('DB failed, using fallback products');
      res.json(defaultProducts);
    }
  });
});
app.use('/api/orders', orderRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', (req, res, next) => {
  const originalSend = res.json;
  res.json = function(data) {
    return originalSend.call(this, data);
  };
  categoryRoutes(req, res, async (err) => {
    if (err) {
      console.log('DB failed, using fallback categories');
      res.json(fallbackCategories);
    }
  });
});
app.use('/api/reviews', reviewRoutes);

app.get('/api', (req, res) => {
  res.send('LIBBAAS API is running!');
});

module.exports = async (req, res) => {
  await initializeDb();
  app(req, res);
};
