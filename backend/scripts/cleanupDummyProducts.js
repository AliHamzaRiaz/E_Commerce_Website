require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // Keep only real admin-created products (P-*). Remove seed/demo rows.
  const del = await c.query(
    `DELETE FROM products WHERE id NOT LIKE 'P-%' RETURNING id, name`
  );
  console.log('Deleted dummy/seed products:', del.rowCount);
  del.rows.forEach((r) => console.log(' -', r.id, r.name));

  const left = await c.query(`SELECT id, name, available, stock FROM products ORDER BY created_at DESC, id DESC`);
  console.log('Remaining products:', left.rows.length);
  console.log(JSON.stringify(left.rows, null, 2));

  // Sync legacy JSON so empty-DB seed won't reintroduce dummies
  const jsonPath = path.join(__dirname, '..', 'data', 'products.json');
  const mapped = left.rows.map((row) => ({
    id: row.id,
    name: row.name,
    // full rows for json — reload from DB with all fields
  }));

  const full = await c.query(
    `SELECT id, name, description, price, original_price, discount, category, colors, sizes, image, available, stock
     FROM products ORDER BY created_at DESC, id DESC`
  );
  const forJson = full.rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    price: Number(r.price || 0),
    originalPrice: Number(r.original_price || 0),
    discount: r.discount || '',
    category: r.category || 'Other',
    colors: Array.isArray(r.colors) ? r.colors : [],
    sizes: Array.isArray(r.sizes) ? r.sizes : [],
    image: r.image || '',
    available: r.available !== false,
    stock: Number(r.stock || 0),
  }));
  fs.writeFileSync(jsonPath, JSON.stringify(forJson, null, 2));
  console.log('Updated products.json with', forJson.length, 'products');

  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
