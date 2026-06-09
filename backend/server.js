const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const { initProductsDb } = require('./utils/productRepository');
const { initOrdersDb } = require('./utils/orderRepository');
const { initUsersTable } = require('./utils/userRepository');
const { initCategoriesTable } = require('./utils/categoryRepository');
const { initReviewsTable } = require('./utils/reviewRepository');
const { defaultProducts } = require('./data/defaultProducts');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.options(/.*/, cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const start = async () => {
  try {
    await initProductsDb(defaultProducts);
    console.log('Products database ready');
  } catch (err) {
    console.warn('[startup] Products DB init failed — product APIs need DATABASE_URL.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initOrdersDb();
    console.log('Orders database ready');
  } catch (err) {
    console.warn('[startup] Orders DB init failed — checkout needs DATABASE_URL.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initUsersTable();
    console.log('Users database ready');
  } catch (err) {
    console.warn('[startup] Users DB init failed — auth/account needs DATABASE_URL.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initCategoriesTable();
    console.log('Categories database ready');
  } catch (err) {
    console.warn('[startup] Categories DB init failed.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initReviewsTable();
    console.log('Reviews database ready');
  } catch (err) {
    console.warn('[startup] Reviews DB init failed.');
    console.warn('[startup]', err?.message || err);
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} (LAN: use this machine's Wi‑Fi IP + :${PORT})`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
