const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
  const authHeader = String(req.header('authorization') || '');
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId || decoded?.role !== 'user') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = { userId: String(decoded.userId), email: decoded.email || '' };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = userAuth;
