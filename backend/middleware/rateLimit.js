/**
 * Lightweight in-memory rate limiter + soft request queue.
 * Product/category/review GETs and static assets are skipped for smooth browsing.
 */

const buckets = new Map();
const QUEUE_MAX = Math.max(1, Number(process.env.REQUEST_QUEUE_MAX || 8));
let activeHeavy = 0;
const heavyWaiters = [];

const clientKey = (req) => {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return xf || req.ip || req.socket?.remoteAddress || 'unknown';
};

const prune = (entry, windowMs) => {
  const cutoff = Date.now() - windowMs;
  entry.hits = entry.hits.filter((t) => t > cutoff);
};

const createRateLimit = ({ windowMs, max, message, keyGenerator }) => {
  const limit = Math.max(1, Number(max) || 60);
  const window = Math.max(1000, Number(windowMs) || 60_000);
  const msg = message || 'Too many requests. Please try again shortly.';

  return (req, res, next) => {
    const key = `${req.baseUrl || ''}${req.path || ''}:${(keyGenerator || clientKey)(req)}`;
    let entry = buckets.get(key);
    if (!entry) {
      entry = { hits: [] };
      buckets.set(key, entry);
    }
    prune(entry, window);
    if (entry.hits.length >= limit) {
      const retryAfter = Math.ceil((entry.hits[0] + window - Date.now()) / 1000);
      res.setHeader('Retry-After', String(Math.max(1, retryAfter)));
      return res.status(429).json({ message: msg, retryAfter: Math.max(1, retryAfter) });
    }
    entry.hits.push(Date.now());
    return next();
  };
};

const shouldSkipBrowse = (req) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') return false;
  const url = String(req.originalUrl || req.url || '');
  return (
    url.startsWith('/api/products') ||
    url.startsWith('/api/categories') ||
    url.startsWith('/api/reviews') ||
    url.startsWith('/uploads') ||
    url.startsWith('/assets') ||
    url === '/' ||
    url.startsWith('/api/test') ||
    url.startsWith('/api/captcha')
  );
};

const globalRateLimit = createRateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
  max: Number(process.env.RATE_LIMIT_MAX || 300),
  message: 'Too many requests from this network. Please slow down.',
});

const globalLimiter = (req, res, next) => {
  if (shouldSkipBrowse(req)) return next();
  return globalRateLimit(req, res, next);
};

const authRateLimit = createRateLimit({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60_000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  message: 'Too many auth attempts. Please wait and try again.',
});

const checkoutRateLimit = createRateLimit({
  windowMs: Number(process.env.CHECKOUT_RATE_LIMIT_WINDOW_MS || 10 * 60_000),
  max: Number(process.env.CHECKOUT_RATE_LIMIT_MAX || 15),
  message: 'Too many checkout attempts. Please wait a few minutes.',
});

const requestQueue = (req, res, next) => {
  if (shouldSkipBrowse(req)) return next();
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();

  const release = () => {
    activeHeavy = Math.max(0, activeHeavy - 1);
    const waiter = heavyWaiters.shift();
    if (waiter) waiter();
  };

  const run = () => {
    activeHeavy += 1;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      release();
    };
    res.on('finish', done);
    res.on('close', done);
    next();
  };

  if (activeHeavy < QUEUE_MAX) {
    run();
    return;
  }

  const timer = setTimeout(() => {
    const idx = heavyWaiters.indexOf(resume);
    if (idx >= 0) heavyWaiters.splice(idx, 1);
    res.status(503).json({ message: 'Server is busy. Please try again in a moment.' });
  }, Number(process.env.REQUEST_QUEUE_TIMEOUT_MS || 12_000));

  const resume = () => {
    clearTimeout(timer);
    run();
  };
  heavyWaiters.push(resume);
};

// Periodic cleanup to avoid unbounded memory
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets.entries()) {
    entry.hits = entry.hits.filter((t) => now - t < 30 * 60_000);
    if (entry.hits.length === 0) buckets.delete(key);
  }
}, 5 * 60_000).unref?.();

module.exports = {
  createRateLimit,
  globalLimiter,
  authRateLimit,
  checkoutRateLimit,
  requestQueue,
  clientKey,
};
