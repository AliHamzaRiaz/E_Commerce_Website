const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

const LEGACY_PRODUCTS_JSON = path.join(__dirname, '..', 'data', 'products.json');

let pool;

const getPool = () => {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Add it to backend/.env (e.g. postgresql://user:pass@localhost:5432/luxe_lingerie)'
    );
  }
  pool = new Pool({
    connectionString,
    ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });
  return pool;
};

const jsonbToStringArray = (value) => {
  if (Array.isArray(value)) return value.map(String);
  if (value && typeof value === 'object') return Object.values(value).map(String);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const rowToProduct = (row) => {
  if (!row) return null;
  
  let colorImages = {};
  const rawColorImages = row.color_images || row.color_Images || row.COLOR_IMAGES || row.colorimages;
  
  if (rawColorImages) {
    try {
      colorImages = typeof rawColorImages === 'string' ? JSON.parse(rawColorImages) : rawColorImages;
    } catch (e) {
      console.error('Error parsing color_images for product', row.id, e);
    }
  }

  let variations = {};
  const rawVariations = row.variations || row.VARIATIONS;
  if (rawVariations) {
    try {
      variations = typeof rawVariations === 'string' ? JSON.parse(rawVariations) : rawVariations;
    } catch (e) {
      console.error('Error parsing variations for product', row.id, e);
    }
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    discount: row.discount || '',
    category: row.category || 'Other',
    colors: jsonbToStringArray(row.colors),
    sizes: jsonbToStringArray(row.sizes),
    image: row.image || '',
    available: row.available === true || row.available === 'true' || row.available === 1 || row.available === null || row.available === undefined,
    stock: Number(row.stock || 0),
    colorImages: colorImages || {},
    variations: variations || {},
    type: row.type || '',
    backend_update_timestamp: Date.now(),
  };
};

const initProductsTable = async () => {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price DOUBLE PRECISION NOT NULL DEFAULT 0,
      original_price DOUBLE PRECISION NOT NULL DEFAULT 0,
      discount TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Other',
      colors JSONB NOT NULL DEFAULT '[]'::jsonb,
      sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
      image TEXT NOT NULL DEFAULT '',
      available BOOLEAN NOT NULL DEFAULT true,
      stock INTEGER NOT NULL DEFAULT 0,
      color_images JSONB NOT NULL DEFAULT '{}'::jsonb,
      variations JSONB NOT NULL DEFAULT '{}'::jsonb,
      type TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Ensure color_images, variations, and type columns exist if table already exists
  try {
    await p.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSONB NOT NULL DEFAULT '{}'::jsonb;`);
    await p.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS variations JSONB NOT NULL DEFAULT '{}'::jsonb;`);
    await p.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT;`);
  } catch (e) {
    console.error("Error adding extra columns:", e.message);
  }
  await p.query(`CREATE INDEX IF NOT EXISTS idx_products_category_lower ON products (lower(category));`);
};

const loadLegacyJsonProducts = async () => {
  try {
    const raw = await fs.readFile(LEGACY_PRODUCTS_JSON, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
};

const seedIfEmpty = async (defaultProducts) => {
  const p = getPool();
  const { rows } = await p.query('SELECT COUNT(*)::int AS c FROM products');
  if (rows[0].c > 0) return;

  const fromFile = await loadLegacyJsonProducts();
  const toInsert = fromFile && fromFile.length ? fromFile : defaultProducts;

  const client = await p.connect();
  try {
    await client.query('BEGIN');
    for (const prod of toInsert) {
      const id = String(prod.id);
      await client.query(
        `INSERT INTO products (id, name, description, price, original_price, discount, category, colors, sizes, image, available, stock, color_images)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13::jsonb)`,
        [
          id,
          prod.name,
          prod.description || '',
          Number(prod.price || 0),
          Number(prod.originalPrice ?? prod.price ?? 0),
          prod.discount || '',
          prod.category || 'Other',
          JSON.stringify(Array.isArray(prod.colors) ? prod.colors : []),
          JSON.stringify(Array.isArray(prod.sizes) ? prod.sizes : []),
          prod.image || '',
          prod.available !== false,
          Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0,
          JSON.stringify(prod.colorImages || {}),
        ]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

/** Inserts any seed rows that are missing (by id). Safe when DB already has data. */
const mergeSeedProducts = async (products) => {
  if (!products?.length) return;
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    for (const prod of products) {
      const id = String(prod.id);
      await client.query(
        `INSERT INTO products (id, name, description, price, original_price, discount, category, colors, sizes, image, available, stock, color_images)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13::jsonb)
         ON CONFLICT (id) DO NOTHING`,
        [
          id,
          prod.name,
          prod.description || '',
          Number(prod.price || 0),
          Number(prod.originalPrice ?? prod.price ?? 0),
          prod.discount || '',
          prod.category || 'Other',
          JSON.stringify(Array.isArray(prod.colors) ? prod.colors : []),
          JSON.stringify(Array.isArray(prod.sizes) ? prod.sizes : []),
          prod.image || '',
          prod.available !== false,
          Number.isFinite(Number(prod.stock)) ? Number(prod.stock) : 0,
          JSON.stringify(prod.colorImages || {}),
        ]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const listProducts = async () => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, name, description, price, original_price, discount, category, colors, sizes, image, available, stock, color_images, variations, type
     FROM products ORDER BY created_at DESC, id DESC`
  );
  return rows.map(rowToProduct);
};

const getProductById = async (id) => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, name, description, price, original_price, discount, category, colors, sizes, image, available, stock, color_images, variations, type
     FROM products WHERE id = $1`,
    [String(id)]
  );
  console.log('--- GET PRODUCT BY ID DB ROW ---');
  console.log('Row Keys:', rows[0] ? Object.keys(rows[0]) : 'No row');
  return rows[0] ? rowToProduct(rows[0]) : null;
};

const insertProduct = async (body) => {
  const id = `P-${Date.now()}`;
  const product = {
    id,
    name: body.name,
    description: body.description || '',
    price: Number(body.price || 0),
    originalPrice: Number(body.originalPrice || body.price || 0),
    discount: body.discount || '',
    category: body.category || 'Other',
    colors: Array.isArray(body.colors) ? body.colors : [],
    sizes: Array.isArray(body.sizes) ? body.sizes : [],
    image: body.image || '',
    available: body.available !== false,
    stock: Number.isFinite(Number(body.stock)) ? Number(body.stock) : 0,
    colorImages: body.colorImages || {},
    variations: body.variations || {},
    type: body.type || '',
  };

  const p = getPool();
  await p.query(
    `INSERT INTO products (id, name, description, price, original_price, discount, category, colors, sizes, image, available, stock, color_images, variations, type)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,$10,$11,$12,$13::jsonb,$14::jsonb,$15)`,
    [
      product.id,
      product.name,
      product.description,
      product.price,
      product.originalPrice,
      product.discount,
      product.category,
      JSON.stringify(product.colors),
      JSON.stringify(product.sizes),
      product.image,
      product.available,
      product.stock,
      JSON.stringify(product.colorImages),
      JSON.stringify(product.variations),
      product.type,
    ]
  );
  return product;
};

const updateProduct = async (id, body, prev) => {
  const next = {
    ...prev,
    name: body.name ?? prev.name,
    description: body.description ?? prev.description,
    price: body.price !== undefined ? Number(body.price) : prev.price,
    originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : prev.originalPrice,
    discount: body.discount ?? prev.discount,
    category: body.category ?? prev.category,
    colors: Array.isArray(body.colors) ? body.colors : prev.colors,
    sizes: Array.isArray(body.sizes) ? body.sizes : prev.sizes,
    image: body.image ?? prev.image,
    available: body.available !== undefined ? !!body.available : prev.available,
    stock: body.stock !== undefined ? Number(body.stock) : prev.stock,
    colorImages: body.colorImages ?? prev.colorImages ?? {},
    variations: body.variations ?? prev.variations ?? {},
    type: body.type ?? prev.type ?? '',
  };

  const p = getPool();
  await p.query(
    `UPDATE products SET
      name = $2, description = $3, price = $4, original_price = $5, discount = $6, category = $7,
      colors = $8::jsonb, sizes = $9::jsonb, image = $10, available = $11, stock = $12, color_images = $13::jsonb, variations = $14::jsonb, type = $15
     WHERE id = $1`,
    [
      String(id),
      next.name,
      next.description,
      next.price,
      next.originalPrice,
      next.discount,
      next.category,
      JSON.stringify(next.colors),
      JSON.stringify(next.sizes),
      next.image,
      next.available,
      next.stock,
      JSON.stringify(next.colorImages),
      JSON.stringify(next.variations),
      next.type,
    ]
  );
  return next;
};

const deleteProduct = async (id) => {
  const p = getPool();
  const { rowCount } = await p.query('DELETE FROM products WHERE id = $1', [String(id)]);
  return rowCount > 0;
};

const applyOrderStock = async (items) => {
  const normalized = Array.isArray(items)
    ? items
        .map((it) => ({
          id: String(it?.id || ''),
          quantity: Math.max(0, Number(it?.quantity || 0)),
        }))
        .filter((it) => it.id && it.quantity > 0)
    : [];
  if (normalized.length === 0) return;

  const byId = new Map();
  for (const it of normalized) {
    byId.set(it.id, (byId.get(it.id) || 0) + it.quantity);
  }

  const p = getPool();
  const client = await p.connect();
  try {
    await client.query('BEGIN');
    for (const [id, qty] of byId.entries()) {
      const { rows } = await client.query(
        `SELECT stock FROM products WHERE id = $1 FOR UPDATE`,
        [String(id)]
      );
      if (!rows[0]) throw new Error(`PRODUCT_NOT_FOUND:${id}`);
      const currentStock = Number(rows[0].stock || 0);
      if (currentStock < qty) throw new Error(`INSUFFICIENT_STOCK:${id}`);
      const nextStock = currentStock - qty;
      await client.query(
        `UPDATE products
         SET stock = $2, available = CASE WHEN $2 <= 0 THEN false ELSE available END
         WHERE id = $1`,
        [String(id), nextStock]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const initProductsDb = async (defaultProducts) => {
  await initProductsTable();
  await seedIfEmpty(defaultProducts);
  await mergeSeedProducts(defaultProducts);
};

module.exports = {
  getPool,
  initProductsDb,
  listProducts,
  getProductById,
  insertProduct,
  updateProduct,
  deleteProduct,
  applyOrderStock,
};
