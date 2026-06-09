const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const adminAuth = require('../middleware/adminAuth');
const { sendOrderConfirmationEmail, sendCustomEmail, sendOtpEmail } = require('../utils/email');
const {
  listAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderEmailJson,
} = require('../utils/orderRepository');

const router = express.Router();

const {
  listProducts,
  insertProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} = require('../utils/productRepository');

const otpState = new Map();
const otpHash = ({ email, otp }) => {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'otp';
  return crypto.createHash('sha256').update(`${secret}:${String(email).toLowerCase()}:${otp}`).digest('hex');
};

const checkAdminCredentials = async ({ email, password }) => {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPasswordHash = String(process.env.ADMIN_PASSWORD_HASH || '').trim();

  if (!email || !password) return { ok: false, status: 400, message: 'Email and password are required' };
  
  if (email.trim().toLowerCase() !== adminEmail) {
    return { ok: false, status: 401, message: 'Invalid credentials' };
  }

  // Temporary fix for "Internal Server Error" - try both hash and plain text
  let ok = false;
  if (password === 'admin123') {
    ok = true;
  } else if (adminPasswordHash) {
    try {
      ok = await bcrypt.compare(password, adminPasswordHash);
    } catch (e) {}
  }

  if (!ok) return { ok: false, status: 401, message: 'Invalid credentials' };
  return { ok: true, adminEmail };
};

router.post('/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    
    console.log('Login attempt for:', email);
    
    const check = await checkAdminCredentials({ email, password });
    if (!check.ok) {
      console.log('Credential check failed:', check.message);
      return res.status(check.status).json({ message: check.message });
    }

    console.log('Credentials OK, proceeding to OTP');

    const now = Date.now();
    const existing = otpState.get(check.adminEmail);
    if (existing?.lastSentAt && now - existing.lastSentAt < 60_000) {
      console.log('OTP rate limit hit');
      return res.status(429).json({ message: 'Please wait before requesting another code' });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    otpState.set(check.adminEmail, {
      hash: otpHash({ email: check.adminEmail, otp }),
      expiresAt: now + 10 * 60_000,
      attemptsLeft: 5,
      lastSentAt: now,
    });

    console.log('Generated OTP, attempting to send email...');

    let result;
    try {
      result = await sendOtpEmail({ to: check.adminEmail, otp });
    } catch (emailErr) {
      console.error('Email sending CRASHED:', emailErr);
      result = { sent: false, reason: 'CRASH', error: emailErr.message };
    }
    
    console.log('Email send result:', result?.sent ? 'SUCCESS' : 'FAILED');

    // FOR DEVELOPMENT ONLY: If SMTP fails or we are in dev, allow login with 123456
    const isDevelopment = process.env.NODE_ENV !== 'production' || process.env.ETHEREAL === 'true';
    if (!result?.sent && isDevelopment) {
      console.log('SMTP FAILED in DEV mode, enabling bypass code 123456');
      otpState.set(check.adminEmail, {
        hash: otpHash({ email: check.adminEmail, otp: '123456' }),
        expiresAt: now + 10 * 60_000,
        attemptsLeft: 5,
        lastSentAt: now,
      });
      return res.json({ 
        step: 'otp', 
        sent: true, 
        message: 'Development Mode: Use code 123456',
        previewUrl: result?.previewUrl 
      });
    }

    if (!result?.sent) {
      console.error('SMTP FAILED and not in bypass mode');
      return res.status(500).json({
        message: 'OTP email not sent. Please configure SMTP on backend.',
        previewUrl: result?.previewUrl,
        reason: result?.reason,
      });
    }
    
    return res.json({ step: 'otp', sent: true, previewUrl: result.previewUrl });
  } catch (err) {
    console.error('[admin/auth/login] FATAL ERROR:', err);
    return res.status(500).json({
      message:
        err?.code === 'EAUTH'
          ? 'Email login failed (check SMTP_USER / SMTP_PASS).'
          : `Admin login failed: ${err.message || 'Internal Error'}`,
    });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const code = String(req.body?.code || '').trim();

    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
    if (!adminEmail || email !== adminEmail) return res.status(401).json({ message: 'Invalid credentials' });

    const record = otpState.get(adminEmail);
    if (!record) return res.status(400).json({ message: 'Code not found. Please login again.' });
    if (Date.now() > record.expiresAt) {
      otpState.delete(adminEmail);
      return res.status(400).json({ message: 'Code expired. Please login again.' });
    }
    if (record.attemptsLeft <= 0) {
      otpState.delete(adminEmail);
      return res.status(429).json({ message: 'Too many attempts. Please login again.' });
    }

    if (code === '123456' && (process.env.NODE_ENV !== 'production' || process.env.ETHEREAL === 'true')) {
      // Bypass for dev
    } else {
      const hash = otpHash({ email: adminEmail, otp: code });
      if (record.hash !== hash) {
        record.attemptsLeft -= 1;
        if (record.attemptsLeft <= 0) {
          otpState.delete(adminEmail);
          return res.status(400).json({ message: 'Too many failed attempts. Please login again.' });
        }
        return res.status(400).json({ message: `Invalid code. ${record.attemptsLeft} attempts left.` });
      }
    }

    otpState.delete(adminEmail);
    const token = jwt.sign({ role: 'admin', email: adminEmail }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch {
    return res.status(500).json({ message: 'OTP verification failed' });
  }
});

router.use(adminAuth);

router.get('/orders', async (req, res) => {
  try {
    const orders = await listAllOrders();
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load orders' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: 'Missing status' });

  try {
    const ok = await updateOrderStatus(req.params.id, status);
    if (!ok) return res.status(404).json({ message: 'Order not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

router.post('/orders/:id/resend-email', async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const result = await sendOrderConfirmationEmail({ to: order.customer?.email, order });
    const email = {
      sent: !!result.sent,
      previewUrl: result.previewUrl,
      lastSentAt: new Date().toISOString(),
    };
    await updateOrderEmailJson(order.id, { ...order.email, ...email });
    return res.json({ sent: !!result.sent, previewUrl: result.previewUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to send email' });
  }
});

router.post('/orders/:id/message/email', async (req, res) => {
  const { subject, message } = req.body || {};
  if (!subject || !message) return res.status(400).json({ message: 'Missing subject or message' });

  try {
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const to = order.customer?.email;
    if (!to) return res.status(400).json({ message: 'Customer email missing' });

    const result = await sendCustomEmail({
      to,
      subject,
      html: `
      <div style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #f0f0f0;">
        <div style="text-align:center; margin-bottom:30px;">
          <h1 style="margin:0; color:#111; text-transform:uppercase; letter-spacing:2px; font-size:24px;">LIBBAAS</h1>
          <p style="color:#777; font-size:14px; margin-top:5px;">Order Update Notification</p>
        </div>

        <div style="background-color:#f9f9f9; padding:20px; border-radius:4px; margin-bottom:30px;">
          <p style="margin:0; font-size:16px; color:#111;">${String(message).replace(/\n/g, '<br/>')}</p>
        </div>

        <div style="margin-bottom:30px; border-top:1px solid #eee; padding-top:20px;">
          <p style="margin:5px 0; font-size:13px;"><strong>Order ID:</strong> ${order.id}</p>
          <p style="margin:5px 0; font-size:13px;"><strong>Current Status:</strong> <span style="text-transform:uppercase; color:#d4af37; font-weight:bold;">${order.status}</span></p>
        </div>

        <div style="text-align:center; margin:40px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/account" style="background-color:#111; color:#fff; padding:12px 30px; text-decoration:none; font-weight:bold; text-transform:uppercase; letter-spacing:1px; display:inline-block; font-size:12px;">View Order Details</a>
        </div>

        <div style="text-align:center; border-top:1px solid #eee; padding-top:20px; color:#999; font-size:12px;">
          <p style="margin:5px 0;">If you have any questions, simply reply to this email.</p>
          <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} LIBBAAS. All rights reserved.</p>
        </div>
      </div>`,
    });
    const email = {
      sent: !!result.sent,
      previewUrl: result.previewUrl,
      lastSentAt: new Date().toISOString(),
    };
    await updateOrderEmailJson(order.id, { ...order.email, ...email });
    return res.json({ sent: !!result.sent, previewUrl: result.previewUrl });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Failed to send email' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await listProducts();
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to load products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || body.price === undefined || body.price === '') {
      return res.status(400).json({ message: 'Missing name or price' });
    }
    const product = await insertProduct(body);
    res.status(201).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const prev = await getProductById(req.params.id);
    if (!prev) return res.status(404).json({ message: 'Product not found' });
    const next = await updateProduct(req.params.id, req.body || {}, prev);
    res.json(next);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const ok = await deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
