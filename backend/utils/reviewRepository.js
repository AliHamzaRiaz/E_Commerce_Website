const { getPool } = require('./productRepository');

const initReviewsTable = async () => {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
};

const listReviewsByProduct = async (productId) => {
  const p = getPool();
  const { rows } = await p.query(
    'SELECT * FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
    [String(productId)]
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
    'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
    [String(productId), userName, rating, comment]
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
