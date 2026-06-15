const path = require('path');
const dotenv = require('dotenv');
// Try root .env first, then backend .env
const rootEnvPath = path.join(__dirname, '..', '.env');
const backendEnvPath = path.join(__dirname, '.env');
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath });

const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const reviewRoutes = require('./routes/reviews');
const { initProductsDb, seedIfEmpty, mergeSeedProducts } = require('./utils/productRepository');
const { initOrdersDb } = require('./utils/orderRepository');
const { initUsersTable } = require('./utils/userRepository');
const { initCategoriesTable, seedCategoriesIfEmpty } = require('./utils/categoryRepository');
const { initReviewsTable } = require('./utils/reviewRepository');
const { defaultProducts } = require('./data/defaultProducts');
const { sendCustomEmail } = require('./utils/email');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.options(/.*/, cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "API working" });
});

app.get('/api/debug/seed-products', async (req, res) => {
  try {
    const { seedIfEmpty, mergeSeedProducts, listProducts } = require('./utils/productRepository');
    const { defaultProducts } = require('./data/defaultProducts');
    console.log('🔧 Manually seeding products...');
    await seedIfEmpty(defaultProducts);
    await mergeSeedProducts(defaultProducts);
    const products = await listProducts();
    console.log('✅ Products seeded, total:', products.length);
    res.json({ success: true, count: products.length, products });
  } catch (err) {
    console.error('❌ Failed to seed products:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/debug/admin-creds', (req, res) => {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');
  const hasAdminEmail = !!adminEmail;
  const hasAdminPassword = !!adminPassword;
  res.json({
    hasAdminEmail,
    hasAdminPassword,
    adminEmailLength: adminEmail.length,
    adminEmailFirst3: adminEmail.substring(0, 3) + '...',
    adminPasswordLength: adminPassword.length,
  });
});

app.get('/api/debug/test-email', async (req, res) => {
  const to = req.query.to || process.env.ADMIN_EMAIL;
  if (!to) {
    return res.status(400).json({ error: 'Please provide a "to" query parameter' });
  }
  try {
    console.log('📧 Testing email send to:', to);
    const result = await sendCustomEmail({
      to,
      subject: 'Test Email from LIBBAAS',
      html: `<div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h1>Test Email from LIBBAAS</h1>
        <p>This is a test email to verify your SMTP configuration is working!</p>
        <p>If you received this, your email setup is correct!</p>
      </div>`,
      text: 'This is a test email from LIBBAAS'
    });
    console.log('📧 Test email result:', result);
    res.json({ 
      success: true, 
      sent: !!result.sent, 
      previewUrl: result.previewUrl,
      reason: result.reason,
      smtpConfig: {
        service: process.env.SMTP_SERVICE,
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 3) + '...' : 'not set',
        hasPass: !!process.env.SMTP_PASS,
        mailFrom: process.env.MAIL_FROM
      }
    });
  } catch (err) {
    console.error('❌ Test email failed:', err);
    res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
});

const start = async () => {
  console.log('🚀 Starting server and initializing databases...');
  try {
    await initProductsDb();
    console.log('✅ Products database ready');
    // First check what's in products
    const { listProducts: list } = require('./utils/productRepository');
    const currentProducts = await list();
    console.log(`📊 Current products in DB: ${currentProducts.length}`);
    console.log('📦 Products:', JSON.stringify(currentProducts.map(p => ({id: p.id, name: p.name})), null, 2));
    
    if (currentProducts.length === 0) {
      console.log('⚠️ No products found, seeding defaults...');
      await seedIfEmpty(defaultProducts);
    } else {
      console.log('✅ Products already exist, skipping seed');
    }
    await mergeSeedProducts(defaultProducts);
    console.log('✅ Products merged if missing');
    
    // Check again after seeding
    const productsAfter = await list();
    console.log(`📊 Products after seeding: ${productsAfter.length}`);
    console.log('📦 Final products:', JSON.stringify(productsAfter.map(p => ({id: p.id, name: p.name})), null, 2));
  } catch (err) {
    console.error('[startup] ❌ Products DB init failed!');
    console.error('[startup] Full error:', err);
    console.error('[startup] Error name:', err?.name);
    console.error('[startup] Error message:', err?.message);
    console.error('[startup] Error code:', err?.code);
    console.error('[startup] Stack trace:', err?.stack);
  }
  try {
    await initOrdersDb();
    console.log('✅ Orders database ready');
  } catch (err) {
    console.warn('[startup] Orders DB init failed — checkout needs DATABASE_URL.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initUsersTable();
    console.log('✅ Users database ready');
  } catch (err) {
    console.warn('[startup] Users DB init failed — auth/account needs DATABASE_URL.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initCategoriesTable();
    console.log('✅ Categories database ready');
    await seedCategoriesIfEmpty();
    console.log('✅ Categories seeded if empty');
  } catch (err) {
    console.warn('[startup] Categories DB init failed.');
    console.warn('[startup]', err?.message || err);
  }
  try {
    await initReviewsTable();
    console.log('✅ Reviews database ready');
  } catch (err) {
    console.warn('[startup] Reviews DB init failed.');
    console.warn('[startup]', err?.message || err);
  }
  
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT} (LAN: use this machine's Wi‑Fi IP + :${PORT})`);
  });

  // Catch server errors
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
