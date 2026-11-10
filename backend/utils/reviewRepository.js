const { getPool } = require('./productRepository');

const defaultReviews = [
  { id: 1, userName: 'Ayesha', productId: '1', rating: 5, comment: 'Premium quality clothing at a fair price. Libbaas truly helps you rise above ordinary!' },
  { id: 2, userName: 'Hassan', productId: '2', rating: 5, comment: 'Ordered from the Winter Collection — fabric, fit, and packaging were excellent. Free shipping was a plus.' },
  { id: 3, userName: 'Zara', productId: '3', rating: 5, comment: 'Love the watch I bought. Stylish, affordable, and arrived quickly. Will shop again.' },
  { id: 4, userName: 'Omar', productId: '4', rating: 5, comment: 'Advance payment discount on my big order was great. Quality feels premium without the premium price.' },
  { id: 5, userName: 'Fatima', productId: '5', rating: 5, comment: 'Modern styles and confident looks. Libbaas is becoming my go-to fashion destination.' },
];

const mapReview = (row) => ({
  id: row.id,
  productId: String(row.product_id ?? ''),
  userName: row.user_name,
  rating: Number(row.rating || 0),
  comment: row.comment,
  createdAt: row.created_at,
});

const initReviewsTable = async () => {
  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_name TEXT,
      product_id TEXT,
      rating INT,
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP`);

  // Product IDs are strings like P-123 — migrate INT column if needed
  const { rows: col } = await p.query(`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'product_id'
    LIMIT 1
  `);
  const dataType = String(col[0]?.data_type || '').toLowerCase();
  if (!dataType) {
    await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id TEXT`);
  } else if (dataType !== 'text' && dataType !== 'character varying') {
    // Drop FK first so type change succeeds
    await p.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey`);
    await p.query(`ALTER TABLE reviews ALTER COLUMN product_id TYPE TEXT USING product_id::text`);
  }

  // Allow reviews even if product rows change/delete — avoid insert failures
  await p.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey`);
};

const seedReviewsIfEmpty = async () => {
  const p = getPool();
  const { rows } = await p.query(`SELECT COUNT(*) FROM reviews`);
  const count = Number(rows[0].count);
  if (count > 0) {
    console.log('✅ Reviews already exist, skipping seed');
    return;
  }

  console.log('Seeding fashion reviews...');
  for (const review of defaultReviews) {
    await p.query(
      `INSERT INTO reviews (product_id, user_name, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW())`,
      [String(review.productId), review.userName, review.rating, review.comment]
    );
  }
  console.log('✅ Fashion reviews seeded');
};

const listReviewsByProduct = async (productId) => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
    [String(productId)]
  );
  return rows.map(mapReview);
};

const listAllReviews = async () => {
  const p = getPool();
  const { rows } = await p.query(`SELECT * FROM reviews ORDER BY created_at DESC`);
  return rows.map(mapReview);
};

const addReview = async ({ productId, userName, rating, comment }) => {
  const p = getPool();
  const cleanName = String(userName || '').trim().slice(0, 80) || 'Guest';
  const cleanComment = String(comment || '').trim().slice(0, 2000);
  const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const cleanProductId = String(productId || '').trim();

  if (!cleanProductId) throw new Error('PRODUCT_ID_REQUIRED');
  if (!cleanComment) throw new Error('COMMENT_REQUIRED');

  const { rows } = await p.query(
    `INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
     VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [cleanProductId, cleanName, cleanRating, cleanComment]
  );

  return mapReview(rows[0]);
};

module.exports = {
  initReviewsTable,
  listReviewsByProduct,
  listAllReviews,
  seedReviewsIfEmpty,
  addReview,
  defaultReviews,
};
