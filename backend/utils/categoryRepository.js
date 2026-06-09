const { getPool } = require('./productRepository');

const initCategoriesTable = async () => {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      image TEXT,
      types JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Ensure types column exists if table already exists
  try {
    await p.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS types JSONB NOT NULL DEFAULT '[]'::jsonb;`);
  } catch (e) {
    console.error("Error adding types column to categories:", e.message);
  }

  // Seed initial categories if empty
  const { rows } = await p.query('SELECT COUNT(*)::int AS c FROM categories');
  if (rows[0].c === 0) {
    const initialCategories = [
      { 
        name: 'bra', 
        display_name: 'Bra', 
        types: [
          { name: 'Sports Bra', image: '' },
          { name: 'Pushup Bra', image: '' },
          { name: 'Padded Bra', image: '' },
          { name: 'T-Shirt Bra', image: '' }
        ] 
      },
      { 
        name: 'underwear', 
        display_name: 'Underwear',
        types: [
          { name: 'Bikini', image: '' },
          { name: 'Thong', image: '' },
          { name: 'Hipster', image: '' }
        ]
      },
      { name: 'nightwear', display_name: 'Nightwear', types: [] },
      { name: 'activewear', display_name: 'Activewear', types: [] }
    ];
    for (const cat of initialCategories) {
      await p.query(
        'INSERT INTO categories (name, display_name, types) VALUES ($1, $2, $3)',
        [cat.name, cat.display_name, JSON.stringify(cat.types)]
      );
    }
  }
};

const listCategories = async () => {
  const p = getPool();
  const { rows } = await p.query('SELECT * FROM categories ORDER BY display_name ASC');
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    image: row.image,
    types: Array.isArray(row.types) ? row.types : [],
    createdAt: row.created_at
  }));
};

const addCategory = async ({ name, displayName, image, types = [] }) => {
  const p = getPool();
  const { rows } = await p.query(
    'INSERT INTO categories (name, display_name, image, types) VALUES ($1, $2, $3, $4) RETURNING *',
    [name.toLowerCase().trim(), displayName.trim(), image, JSON.stringify(types)]
  );
  return rows[0];
};

const deleteCategory = async (id) => {
  const p = getPool();
  await p.query('DELETE FROM categories WHERE id = $1', [id]);
};

const updateCategory = async (id, { displayName, image, types }) => {
  const p = getPool();
  const { rows } = await p.query(
    'UPDATE categories SET display_name = $1, image = $2, types = $3 WHERE id = $4 RETURNING *',
    [displayName.trim(), image, JSON.stringify(types || []), id]
  );
  return rows[0];
};

module.exports = {
  initCategoriesTable,
  listCategories,
  addCategory,
  deleteCategory,
  updateCategory
};
