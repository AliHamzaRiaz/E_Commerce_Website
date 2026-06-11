const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '6mb' }));
app.use(express.urlencoded({ extended: true, limit: '6mb' }));

// SIMPLE HEALTH CHECK (NO DB REQUIRED)
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'OK',
    message: 'Vercel Backend is working',
    timestamp: new Date().toISOString(),
    hasDatabase: false,
    usesFallbackData: true
  });
});

// SIMPLE PRODUCTS ENDPOINT (USING LOCAL DATA ONLY)
const defaultProducts = require('../backend/data/defaultProducts').defaultProducts;
app.get('/api/products', (req, res) => {
  return res.json(defaultProducts);
});

// SIMPLE CATEGORIES ENDPOINT
const fallbackCategories = [
  { id: 1, name: 'bra', displayName: 'Bra' },
  { id: 2, name: 'underwear', displayName: 'Underwear' },
  { id: 3, name: 'nightwear', displayName: 'Nightwear' },
  { id: 4, name: 'activewear', displayName: 'Activewear' }
];
app.get('/api/categories', (req, res) => {
  return res.json(fallbackCategories);
});

app.get('/api', (req, res) => {
  res.send('LIBBAAS API is running!');
});

module.exports = (req, res) => {
  app(req, res);
};
