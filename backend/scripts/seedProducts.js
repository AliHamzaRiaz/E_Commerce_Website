/**
 * Syncs the `products` table with `data/defaultProducts.js` (creates table, fills empty DB, merges missing ids).
 * Run from backend folder: npm run seed:products
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { initProductsDb } = require('../utils/productRepository');
const { defaultProducts } = require('../data/defaultProducts');

initProductsDb(defaultProducts)
  .then(() => {
    console.log('Product catalog sync finished (PostgreSQL).');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
