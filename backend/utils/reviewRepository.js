const { getPool } = require('./productRepository');

const initReviewsTable = async () => {
  const p = getPool();
  if (!p) {
    console.log('⚠️ No database available, skipping reviews table init');
    return;
  }
  
  try {
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
        product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    
    // Function to safely add a column
    const addColumnIfMissing = async (colName, definition) => {
      try {
        const colExists = existingColumns.some(c => c.column_name.toLowerCase() === colName.toLowerCase());
        if (!colExists) {
          await p.query(`ALTER TABLE reviews ADD COLUMN ${colName} ${definition}`);
          console.log(`Added column ${colName} to reviews table`);
        }
      } catch (e) {
        console.warn(`Error adding column ${colName}:`, e.message);
      }
    };
    
    // Add missing columns (with defaults for existing rows)
    await addColumnIfMissing('user_name', 'TEXT DEFAULT \'Guest\'');
    await addColumnIfMissing('product_id', 'TEXT DEFAULT \'\'');
    await addColumnIfMissing('rating', 'INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5)');
    await addColumnIfMissing('comment', 'TEXT DEFAULT \'\'');
    await addColumnIfMissing('created_at', 'TIMESTAMPTZ DEFAULT now()');
  } catch (err) {
    console.warn('⚠️ Failed to init reviews table:', err.message);
  }
};

const listReviewsByProduct = async (productId) => {
  const p = getPool();
  if (!p) {
    console.log('⚠️ No database available, returning empty reviews');
    return [];
  }
  try {
    // Get existing columns first to handle name variations
    const { rows: columns } = await p.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'reviews'
    `);
    const colNames = columns.map(c => c.column_name.toLowerCase());
    
    // Determine column names to use
    const productIdCol = colNames.includes('product_id') ? 'product_id' : (colNames.includes('productid') ? 'productid' : 'id');
    const userNameCol = colNames.includes('user_name') ? 'user_name' : (colNames.includes('username') ? 'username' : 'user_name');
    const ratingCol = colNames.includes('rating') ? 'rating' : 'rating';
    const commentCol = colNames.includes('comment') ? 'comment' : (colNames.includes('content') ? 'content' : (colNames.includes('text') ? 'text' : 'comment'));
    const createdAtCol = colNames.includes('created_at') ? 'created_at' : (colNames.includes('createdat') ? 'createdat' : 'created_at');
    
    // Build query
    const { rows } = await p.query(
      `SELECT * FROM reviews WHERE ${productIdCol} = $1 ORDER BY ${createdAtCol} DESC`,
      [String(productId)]
    );
    
    return rows.map(row => ({
      id: row.id,
      productId: row[productIdCol],
      userName: row[userNameCol],
      rating: row[ratingCol],
      comment: row[commentCol],
      createdAt: row[createdAtCol]
    }));
  } catch (err) {
    console.warn('⚠️ Failed to list reviews, returning empty array:', err.message);
    return [];
  }
};

const addReview = async ({ productId, userName, rating, comment }) => {
  const p = getPool();
  if (!p) {
    console.log('⚠️ No database available, skipping addReview');
    throw new Error('Database not available');
  }
  
  // Get existing columns first
  const { rows: columns } = await p.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'reviews'
  `);
  const colNames = columns.map(c => c.column_name.toLowerCase());
  
  // Determine column names to use
  const productIdCol = colNames.includes('product_id') ? 'product_id' : (colNames.includes('productid') ? 'productid' : 'product_id');
  const userNameCol = colNames.includes('user_name') ? 'user_name' : (colNames.includes('username') ? 'username' : 'user_name');
  const ratingCol = colNames.includes('rating') ? 'rating' : 'rating';
  const commentCol = colNames.includes('comment') ? 'comment' : (colNames.includes('content') ? 'content' : (colNames.includes('text') ? 'text' : 'comment'));
  
  // Build insert query
  const { rows } = await p.query(
    `INSERT INTO reviews (${productIdCol}, ${userNameCol}, ${ratingCol}, ${commentCol}) VALUES ($1, $2, $3, $4) RETURNING *`,
    [String(productId), userName, rating, comment]
  );
  
  return {
    id: rows[0].id,
    productId: rows[0][productIdCol],
    userName: rows[0][userNameCol],
    rating: rows[0][ratingCol],
    comment: rows[0][commentCol],
    createdAt: rows[0].created_at || rows[0].createdat || new Date()
  };
};

module.exports = {
  initReviewsTable,
  listReviewsByProduct,
  addReview
};
