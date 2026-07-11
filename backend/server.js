const path = require('path');
const dotenv = require('dotenv');

console.log('========================================');
console.log('🚀 SERVER: STARTING BOOTSTRAP');
console.log('========================================');

// Load environment variables
const rootEnvPath = path.join(__dirname, '..', '.env');
const backendEnvPath = path.join(__dirname, '.env');
console.log('📂 Loading env vars from root:', rootEnvPath);
console.log('📂 Loading env vars from backend:', backendEnvPath);
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
const { initProductsDb, seedIfEmpty } = require('./utils/productRepository');
const { initOrdersDb } = require('./utils/orderRepository');
const { initUsersTable } = require('./utils/userRepository');
const { initCategoriesTable, seedCategoriesIfEmpty } = require('./utils/categoryRepository');
const { initReviewsTable, seedReviewsIfEmpty } = require('./utils/reviewRepository');
const { defaultProducts } = require('./data/defaultProducts');
const { sendCustomEmail, initTransporter } = require('./utils/email');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.options(/.*/, cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve frontend static files
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuildPath));

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
  res.json({ message: 'API working' });
});

// Catch-all route to serve React app for any non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  res.sendFile(indexPath);
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

// ============================================
// 📧 TEST EMAIL ENDPOINT - FOR DEBUGGING
// ============================================
app.get('/api/debug/test-email', async (req, res) => {
  console.log('\n========================================');
  console.log('📧 TEST EMAIL ENDPOINT: RECEIVED REQUEST');
  console.log('========================================');

  try {
    const to = req.query.to || process.env.ADMIN_EMAIL;
    console.log('📋 Test email params:');
    console.log('To:', to);

    if (!to) {
      console.log('❌ Missing "to" parameter');
      return res.status(400).json({
        success: false,
        error: 'Please provide a "to" query parameter (e.g., ?to=you@example.com)'
      });
    }

    console.log('\n📧 Sending test email via Brevo SMTP...');
    const result = await sendCustomEmail({
      to,
      subject: '✅ TEST EMAIL - LIBBAAS (SMTP)',
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #111; text-align: center;">✅ TEST EMAIL SUCCESS (SMTP)!</h1>
          <p style="font-size: 16px;">Hi there!</p>
          <p style="font-size: 16px;">If you're reading this, your Brevo SMTP setup is <strong>WORKING PERFECTLY!</strong> 🎉</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Debug Info:</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Sent from: ${process.env.EMAIL_FROM}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Sent to: ${to}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Time: ${new Date().toLocaleString()}</p>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">This email was sent using Nodemailer & Brevo SMTP from your LIBBAAS backend.</p>
        </div>
      `,
      text: `TEST EMAIL SUCCESS (SMTP)!\nIf you're reading this, your Brevo SMTP setup is WORKING PERFECTLY!`
    });

    console.log('\n📧 Test email result:', JSON.stringify(result, null, 2));

    res.json({
      success: true,
      sent: result.sent,
      previewUrl: result.previewUrl,
      reason: result.reason,
      smtpConfig: {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0,10) + '...' : 'not set',
        EMAIL_FROM: process.env.EMAIL_FROM
      },
      result: result
    });

  } catch (err) {
    console.error('\n❌ TEST EMAIL FAILED CATASTROPHICALLY!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('Full Error Object:', JSON.stringify(err, null, 2));

    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

const start = async () => {
  console.log('\n========================================');
  console.log('🚀 SERVER: INITIALIZING EVERYTHING');
  console.log('========================================');

  console.log('\n📋 ALL ENVIRONMENT VARIABLES (filtered):');
  const envToLog = {};
  Object.keys(process.env).forEach(key => {
    if (['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'EMAIL_FROM', 'ADMIN_EMAIL', 'PORT', 'NODE_ENV'].includes(key)) {
      envToLog[key] = key.includes('PASS') || key.includes('SECRET') ? '***' : process.env[key];
    } else if (key.includes('SMTP') || key.includes('EMAIL')) {
      envToLog[key] = '***';
    }
  });
  console.log(JSON.stringify(envToLog, null, 2));

  // Initialize email service FIRST with VERIFY()
  console.log('\n📧 STEP 1: INITIALIZE & VERIFY EMAIL SERVICE (SMTP)');
  try {
    await initTransporter();
  } catch (err) {
    console.error('❌ Email service initialization failed:', err);
  }

  // Initialize databases
  try {
    await initProductsDb();
    console.log('✅ Products database ready');
    const { listProducts: list } = require('./utils/productRepository');
    const currentProducts = await list();
    console.log('📊 Current products in DB:', currentProducts.length);

    if (currentProducts.length === 0) {
      console.log('⚠️ No products found, seeding defaults...');
      await seedIfEmpty(defaultProducts);
    } else {
      console.log('✅ Products already exist, skipping seed');
    }

    const productsAfter = await list();
    console.log('📊 Products after seeding:', productsAfter.length);
  } catch (err) {
    console.error('[startup] ❌ Products DB init failed!');
    console.error('[startup] Full error:', err);
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
    await seedReviewsIfEmpty();
  } catch (err) {
    console.warn('[startup] Reviews DB init failed.');
    console.warn('[startup]', err?.message || err);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n========================================');
    console.log('✅ SERVER IS RUNNING!');
    console.log(`   📡 Port: ${PORT}`);
    console.log(`   🌐 Local: http://localhost:${PORT}`);
    console.log(`   📧 Test email: http://localhost:${PORT}/api/debug/test-email?to=you@example.com`);
    console.log('========================================');
  });

  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });
};

start().catch((err) => {
  console.error('\n❌ SERVER CRASHED ON STARTUP!');
  console.error('Error:', err);
  process.exit(1);
});
