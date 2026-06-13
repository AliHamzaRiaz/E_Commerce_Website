const { getPool } = require('./productRepository');

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
  addReview
};
