const { getPool } = require('./productRepository');

const initOrdersTable = async () => {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      customer_email TEXT NOT NULL,
      customer_json JSONB NOT NULL,
      items_json JSONB NOT NULL,
      payment_method TEXT NOT NULL,
      payment_details_json JSONB,
      subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
      discount DOUBLE PRECISION NOT NULL DEFAULT 0,
      total DOUBLE PRECISION NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      status_updated_at TIMESTAMPTZ,
      signature_image TEXT NOT NULL DEFAULT '',
      email_json JSONB
    );
  `);
  // Migration: Add status_updated_at if it doesn't exist
  try {
    await p.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;`);
  } catch (err) {
    console.error('[initOrdersTable] migration failed:', err.message);
  }
  await p.query(`CREATE INDEX IF NOT EXISTS idx_orders_customer_email_lower ON orders (lower(customer_email));`);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);`);
};

const rowToOrder = (row) => {
  const customer = row.customer_json && typeof row.customer_json === 'object' ? row.customer_json : {};
  const items = Array.isArray(row.items_json) ? row.items_json : [];
  const email = row.email_json && typeof row.email_json === 'object' ? row.email_json : {};
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    customer: {
      fullName: customer.fullName || '',
      email: customer.email || row.customer_email || '',
      address: customer.address || '',
      phone: customer.phone || '',
      note: customer.note || '',
    },
    items,
    paymentMethod: row.payment_method,
    paymentDetails: row.payment_details_json || undefined,
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    status: row.status || 'PLACED',
    statusUpdatedAt: row.status_updated_at ? new Date(row.status_updated_at).toISOString() : null,
    signatureImage: row.signature_image || '',
    email,
  };
};

const insertOrder = async ({
  id,
  customer,
  items,
  paymentMethod,
  paymentDetails,
  subtotal,
  discount,
  total,
  status,
  signatureImage,
  emailMeta,
}) => {
  const p = getPool();
  const emailNorm = String(customer?.email || '').trim().toLowerCase();
  await p.query(
    `INSERT INTO orders (
      id, customer_email, customer_json, items_json, payment_method, payment_details_json,
      subtotal, discount, total, status, status_updated_at, signature_image, email_json
    ) VALUES ($1,$2,$3::jsonb,$4::jsonb,$5,$6::jsonb,$7,$8,$9,$10,now(),$11,$12::jsonb)`,
    [
      id,
      emailNorm,
      JSON.stringify({
        fullName: customer.fullName,
        email: customer.email,
        address: customer.address,
        phone: customer.phone,
        note: customer.note || '',
      }),
      JSON.stringify(items),
      paymentMethod,
      paymentDetails ? JSON.stringify(paymentDetails) : null,
      subtotal,
      discount,
      total,
      status,
      String(signatureImage || ''),
      JSON.stringify(emailMeta || {}),
    ]
  );
};

const listAllOrders = async () => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, created_at, customer_email, customer_json, items_json, payment_method, payment_details_json,
            subtotal, discount, total, status, status_updated_at, signature_image, email_json
     FROM orders ORDER BY created_at DESC, id DESC`
  );
  return rows.map(rowToOrder);
};

const listRecentOrdersByEmail = async (email, limit = 10) => {
  const p = getPool();
  const e = String(email || '').trim().toLowerCase();
  const { rows } = await p.query(
    `SELECT id, created_at, customer_email, customer_json, items_json, payment_method, payment_details_json,
            subtotal, discount, total, status, status_updated_at, signature_image, email_json
     FROM orders WHERE lower(customer_email) = lower($1)
     ORDER BY created_at DESC LIMIT $2`,
    [e, Math.min(50, Math.max(1, Number(limit) || 10))]
  );
  return rows.map(rowToOrder);
};

const getOrderById = async (id) => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, created_at, customer_email, customer_json, items_json, payment_method, payment_details_json,
            subtotal, discount, total, status, status_updated_at, signature_image, email_json
     FROM orders WHERE id = $1`,
    [String(id)]
  );
  return rows[0] ? rowToOrder(rows[0]) : null;
};

const updateOrderStatus = async (id, status) => {
  const p = getPool();
  const { rowCount } = await p.query(
    `UPDATE orders SET status = $2, status_updated_at = now() WHERE id = $1`,
    [String(id), String(status)]
  );
  return rowCount > 0;
};

const updateOrderEmailJson = async (id, emailJson) => {
  const p = getPool();
  await p.query(`UPDATE orders SET email_json = $2::jsonb WHERE id = $1`, [String(id), JSON.stringify(emailJson || {})]);
};

const initOrdersDb = async () => {
  await initOrdersTable();
};

module.exports = {
  initOrdersDb,
  insertOrder,
  listAllOrders,
  listRecentOrdersByEmail,
  getOrderById,
  updateOrderStatus,
  updateOrderEmailJson,
};
