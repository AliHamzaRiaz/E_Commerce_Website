const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const url = String(req.originalUrl || req.url || '');
  if (url.includes('/api/admin/auth/login') || url.includes('/api/admin/auth/verify-otp') || url.endsWith('/auth/login') || url.endsWith('/auth/verify-otp')) {
    return next();
  }

  const authHeader = String(req.header('authorization') || '');
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.role === 'admin') return next();
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  }

  const requiredKey = process.env.ADMIN_KEY;
  if (requiredKey) {
    const key = req.header('x-admin-key');
    if (key && key === requiredKey) return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
};

module.exports = adminAuth;
