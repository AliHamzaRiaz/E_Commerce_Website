const { getPool } = require('./productRepository');

const defaultReviews = [
  { id: 1, userName: 'Ayesha', productId: 1, rating: 5, comment: 'Premium quality clothing at a fair price. Libbaas truly helps you rise above ordinary!' },
  { id: 2, userName: 'Hassan', productId: 2, rating: 5, comment: 'Ordered from the Winter Collection — fabric, fit, and packaging were excellent. Free shipping was a plus.' },
  { id: 3, userName: 'Zara', productId: 3, rating: 5, comment: 'Love the watch I bought. Stylish, affordable, and arrived quickly. Will shop again.' },
  { id: 4, userName: 'Omar', productId: 4, rating: 5, comment: 'Advance payment discount on my big order was great. Quality feels premium without the premium price.' },
  { id: 5, userName: 'Fatima', productId: 5, rating: 5, comment: 'Modern styles and confident looks. Libbaas is becoming my go-to fashion destination.' },
];

const initReviewsTable = async () => {
  const p = getPool();
  
  // First check what columns exist
  const { rows: existingColumns } = await p.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'reviews'
  `);
  
  console.log('Existing reviews table columns:', existingColumns.map(c => c.column_name));
  
  // Create table if it doesn't exist
  await p.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_name TEXT,
      product_id INT,
      rating INT,
      comment TEXT,
      created_at TIMESTAMP
    );
  `);
  
  // Add missing columns
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_name TEXT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_id INT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT`);
  await p.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP`);
};

const seedReviewsIfEmpty = async () => {
  const p = getPool();

  const { rows } = await p.query(`SELECT COUNT(*) FROM reviews`);
  const count = Number(rows[0].count);
  // Refresh demo reviews for the fashion rebrand when only seed-sized data exists
  if (count === 0 || count <= 8) {
    console.log('Seeding fashion reviews...');
    await p.query('DELETE FROM reviews');
    for (const review of defaultReviews) {
      await p.query(
        `INSERT INTO reviews (product_id, user_name, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW())`,
        [review.productId, review.userName, review.rating, review.comment]
      );
    }
    console.log('✅ Fashion reviews seeded');
  } else {
    console.log('✅ Reviews already exist, skipping seed');
  }
};

const listReviewsByProduct = async (productId) => {
  const p = getPool();
  
  const { rows } = await p.query(
    `SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
    [productId]
  );
  
  return rows.map(row => ({
    id: row.id,
    productId: row.product_id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at
  }));
};

const listAllReviews = async () => {
  const p = getPool();
  
  const { rows } = await p.query(
    `SELECT * FROM reviews ORDER BY created_at DESC`
  );
  
  return rows.map(row => ({
    id: row.id,
    productId: row.product_id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at
  }));
};

const addReview = async ({ productId, userName, rating, comment }) => {
  const p = getPool();
  
  const { rows } = await p.query(
    `INSERT INTO reviews (product_id, user_name, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
    [productId, userName, rating, comment]
  );
  
  return {
    id: rows[0].id,
    productId: rows[0].product_id,
    userName: rows[0].user_name,
    rating: rows[0].rating,
    comment: rows[0].comment,
    createdAt: rows[0].created_at
  };
};

module.exports = {
  initReviewsTable,
  listReviewsByProduct,
  listAllReviews,
  seedReviewsIfEmpty,
  addReview,
  defaultReviews
};
