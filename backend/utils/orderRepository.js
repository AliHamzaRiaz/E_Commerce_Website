const { getPool } = require('./productRepository');

const initOrdersTable = async () => {
  const p = getPool();
  
  // First, try to create table with all columns
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        customer_email TEXT NOT NULL,
        customer_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        payment_method TEXT NOT NULL DEFAULT 'cod',
        payment_details_json JSONB,
        subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
        discount DOUBLE PRECISION NOT NULL DEFAULT 0,
        total DOUBLE PRECISION NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PLACED',
        status_updated_at TIMESTAMPTZ,
        signature_image TEXT NOT NULL DEFAULT '',
        email_json JSONB DEFAULT '{}'::jsonb
      );
    `);
  } catch (err) {
    console.warn('[initOrdersTable] Table might already exist, adding missing columns...');
  }
  
  // Now add all columns one by one, in case some are missing
  const columnsToAdd = [
    { name: 'customer_email', type: 'TEXT', default: "''" },
    { name: 'customer_json', type: 'JSONB', default: "'{}'::jsonb" },
    { name: 'items_json', type: 'JSONB', default: "'[]'::jsonb" },
    { name: 'payment_method', type: 'TEXT', default: "'cod'" },
    { name: 'payment_details_json', type: 'JSONB' },
    { name: 'subtotal', type: 'DOUBLE PRECISION', default: '0' },
    { name: 'discount', type: 'DOUBLE PRECISION', default: '0' },
    { name: 'total', type: 'DOUBLE PRECISION', default: '0' },
    { name: 'status', type: 'TEXT', default: "'PLACED'" },
    { name: 'status_updated_at', type: 'TIMESTAMPTZ' },
    { name: 'signature_image', type: 'TEXT', default: "''" },
    { name: 'email_json', type: 'JSONB', default: "'{}'::jsonb" }
  ];

  for (const col of columnsToAdd) {
    try {
      let alterSql = `ALTER TABLE orders ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`;
      if (col.default) {
        alterSql += ` NOT NULL DEFAULT ${col.default}`;
      }
      await p.query(alterSql);
      console.log(`[initOrdersTable] Added/verified column: ${col.name}`);
    } catch (err) {
      console.warn(`[initOrdersTable] Column ${col.name} might already exist:`, err.message);
    }
  }
  
  await p.query(`CREATE INDEX IF NOT EXISTS idx_orders_customer_email_lower ON orders (lower(customer_email));`);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);`);
};

const rowToOrder = (row) => {
  // Log the raw row to see what columns exist
  console.log('\n🔍 RAW ORDER ROW:', JSON.stringify(row, null, 2));

  // Helper to safely parse JSON
  const safeParseJson = (val) => {
    if (typeof val === 'object' && val !== null) return val;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    return null;
  };

  // Try to get customer data from multiple possible sources
  let customer = {};
  const cj1 = safeParseJson(row.customer_json);
  const cj2 = safeParseJson(row.customerJson);
  const sj1 = safeParseJson(row.shipping_info);
  const sj2 = safeParseJson(row.shippingInfo);
  
  if (cj1) customer = cj1;
  else if (cj2) customer = cj2;
  else if (sj1) customer = sj1;
  else if (sj2) customer = sj2;
  else {
    // Try to build customer from individual columns
    customer = {
      fullName: row.customer_full_name || row.customerFullName || row.fullName || row.full_name || row.name || '',
      email: row.customer_email || row.customerEmail || row.email || row.user_email || '',
      address: row.customer_address || row.customerAddress || row.address || row.shipping_address || '',
      phone: row.customer_phone || row.customerPhone || row.phone || row.shipping_phone || '',
      note: row.customer_note || row.customerNote || row.note || ''
    };
  }

  // Try to get items from multiple possible sources
  let items = [];
  const ij1 = safeParseJson(row.items_json);
  const ij2 = safeParseJson(row.itemsJson);
  const ij3 = safeParseJson(row.items);
  if (Array.isArray(ij1)) items = ij1;
  else if (Array.isArray(ij2)) items = ij2;
  else if (Array.isArray(ij3)) items = ij3;

  // Try to get email_json from multiple possible sources
  let email = {};
  const ej1 = safeParseJson(row.email_json);
  const ej2 = safeParseJson(row.emailJson);
  if (ej1) email = ej1;
  else if (ej2) email = ej2;

  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    customer: {
      fullName: customer.fullName || customer.full_name || row.customer_full_name || row.full_name || row.name || '',
      email: customer.email || row.customer_email || row.email || row.user_email || '',
      address: customer.address || row.customer_address || row.address || row.shipping_address || '',
      phone: customer.phone || row.customer_phone || row.phone || row.shipping_phone || '',
      note: customer.note || row.customer_note || row.note || '',
    },
    items,
    paymentMethod: row.payment_method || row.paymentMethod || 'cod',
    paymentDetails: safeParseJson(row.payment_details_json) || safeParseJson(row.paymentDetailsJson) || row.payment_details || row.paymentDetails || undefined,
    subtotal: Number(row.subtotal || 0),
    discount: Number(row.discount || 0),
    total: Number(row.total || 0),
    status: row.status || 'PLACED',
    statusUpdatedAt: row.status_updated_at || row.statusUpdatedAt ? new Date(row.status_updated_at || row.statusUpdatedAt).toISOString() : null,
    signatureImage: row.signature_image || row.signatureImage || '',
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
  console.log('🔍 Querying orders from DB...');
  // Select ALL columns to make sure we capture everything!
  const { rows } = await p.query(
    `SELECT * FROM orders ORDER BY created_at DESC, id DESC`
  );
  console.log('📦 Found', rows.length, 'order(s) in DB');
  console.log('📄 Raw rows:', JSON.stringify(rows, null, 2));
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
