const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userAuth = require('../middleware/userAuth');
const {
  createUser,
  findUserWithPasswordByEmail,
  findUserById,
  updateUserFavorites,
  updateUserCart,
  updateUserResetToken,
  findUserByResetToken,
  updateUserPassword,
} = require('../utils/userRepository');
const { listRecentOrdersByEmail } = require('../utils/orderRepository');
const { sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
});

const signUserToken = (u) =>
  jwt.sign({ role: 'user', userId: u.id, email: u.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email address' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    const exists = await findUserWithPasswordByEmail(email);
    if (exists) return res.status(409).json({ message: 'Account already exists for this email' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      id: `USR-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      name,
      email,
      passwordHash,
    });
    return res.status(201).json({ token: signUserToken(user), user: safeUser(user) });
  } catch (e) {
    console.error('[POST /api/users/register]', e);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    console.log('[POST /login] Attempt for email:', email);
    
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    
    const user = await findUserWithPasswordByEmail(email);
    console.log('[POST /login] User found in DB:', !!user);
    
    if (!user) {
      console.log('[POST /login] Login failed: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    console.log('[POST /login] Password comparison result:', ok);
    
    if (!ok) {
      console.log('[POST /login] Login failed: Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('[POST /login] Login successful for user:', user.id);
    return res.json({ token: signUserToken(user), user: safeUser(user) });
  } catch (e) {
    console.error('[POST /api/users/login] ERROR:', e);
    return res.status(500).json({ message: 'Login failed: ' + (e.message || 'Internal Error') });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    console.log('[POST /forgot-password] Email received:', email);
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await findUserWithPasswordByEmail(email);
    console.log('[POST /forgot-password] User found in DB:', !!user);
    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    console.log('[POST /forgot-password] Saving token to DB...');
    await updateUserResetToken(email, resetToken, resetTokenExpiry);
    console.log('[POST /forgot-password] Token saved successfully');

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    console.log('[POST /forgot-password] Sending email to:', email);
    const result = await sendPasswordResetEmail({ to: email, resetUrl });
    console.log('[POST /forgot-password] Email send result:', result);

    if (!result.sent) {
      console.error('[POST /forgot-password] Email failed to send:', result.reason);
      return res.status(500).json({ 
        message: 'Account found, but failed to send email. Error: ' + result.reason 
      });
    }

    return res.json({
      message: 'If an account exists for this email, a reset link has been sent.',
      previewUrl: result.previewUrl,
    });
  } catch (e) {
    console.error('[POST /api/users/forgot-password] CRITICAL ERROR:', e);
    return res.status(500).json({ 
      message: 'Server Error: ' + (e.message || 'Internal Error') 
    });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await findUserByResetToken(token);
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(user.id, passwordHash);

    return res.json({ message: 'Password has been reset successfully' });
  } catch (e) {
    console.error('[POST /api/users/reset-password]', e);
    return res.status(500).json({ message: 'Failed to reset password' });
  }
});

router.get('/me', userAuth, async (req, res) => {
  const user = await findUserById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: safeUser(user), favorites: user.favorites, cart: user.cart });
});

router.get('/favorites', userAuth, async (req, res) => {
  const user = await findUserById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ favorites: user.favorites });
});

router.put('/favorites', userAuth, async (req, res) => {
  const favorites = Array.isArray(req.body?.favorites) ? req.body.favorites.map(String) : [];
  await updateUserFavorites(req.user.userId, favorites);
  return res.json({ ok: true, favorites });
});

router.get('/cart', userAuth, async (req, res) => {
  const user = await findUserById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ cart: user.cart });
});

router.put('/cart', userAuth, async (req, res) => {
  const cart = Array.isArray(req.body?.cart) ? req.body.cart : [];
  await updateUserCart(req.user.userId, cart);
  return res.json({ ok: true, cart });
});

router.get('/history', userAuth, async (req, res) => {
  const user = await findUserById(req.user.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const orders = await listRecentOrdersByEmail(user.email, 20);
  return res.json({ orders });
});

module.exports = router;
