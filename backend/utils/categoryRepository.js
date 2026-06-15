const { getPool } = require('./productRepository');

const defaultCategories = [
  { name: 'bra', displayName: 'Bra', image: '', types: ['Push-Up', 'Bralette', 'Sports', 'Lace', 'Seamless'] },
  { name: 'underwear', displayName: 'Underwear', image: '', types: ['Hipster', 'Thong', 'Brief', 'High-Waist'] },
  { name: 'nightwear', displayName: 'Nightwear', image: '', types: ['Chemise', 'Nightgown', 'Robe'] },
  { name: 'activewear', displayName: 'Activewear', image: '', types: ['Sports Bra', 'Leggings'] }
];

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

  // Get existing columns
  const { rows: colRows } = await p.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'categories'
  `);
  const existingColumns = colRows.map(c => c.column_name);
  console.log('[initCategoriesTable] Existing columns:', existingColumns);

  // Ensure image column exists
  if (!existingColumns.includes('image')) {
    try {
      await p.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS image TEXT;`);
      console.log('[initCategoriesTable] Added image column');
    } catch (e) {
      console.error('[initCategoriesTable] Error adding image column:', e.message);
    }
  }

  // Ensure types column exists
  if (!existingColumns.includes('types')) {
    try {
      await p.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS types JSONB NOT NULL DEFAULT '[]'::jsonb;`);
      console.log('[initCategoriesTable] Added types column');
    } catch (e) {
      console.error('[initCategoriesTable] Error adding types column:', e.message);
    }
  }
};

const listCategories = async () => {
  const p = getPool();
  const { rows } = await p.query('SELECT * FROM categories ORDER BY display_name ASC');
  console.log('[listCategories] Raw rows from DB:', rows);
  return rows.map(row => {
    let parsedTypes;
    try {
      if (typeof row.types === 'string') {
        parsedTypes = JSON.parse(row.types);
      } else if (Array.isArray(row.types)) {
        parsedTypes = row.types;
      } else {
        parsedTypes = [];
      }
    } catch (e) {
      console.error('[listCategories] Error parsing types:', e);
      parsedTypes = [];
    }
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      image: row.image,
      types: parsedTypes,
      createdAt: row.created_at
    };
  });
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
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  await p.query('DELETE FROM categories WHERE id = $1', [numericId]);
};

const updateCategory = async (id, { displayName, image, types }) => {
  const p = getPool();
  try {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    console.log('[updateCategory] Updating category', { id: numericId, displayName, image, types });
    
    // First, get the existing category
    const { rows: existingRows } = await p.query(
      'SELECT * FROM categories WHERE id = $1',
      [numericId]
    );
    if (existingRows.length === 0) {
      return null;
    }
    const existing = existingRows[0];
    
    // Prepare fields to update, default to existing values if not provided
    const finalDisplayName = displayName !== undefined ? displayName.trim() : existing.display_name;
    const finalImage = image !== undefined ? image : existing.image;
    const finalTypes = types !== undefined ? types : (Array.isArray(existing.types) ? existing.types : []);
    
    const { rows } = await p.query(
      'UPDATE categories SET display_name = $1, image = $2, types = $3 WHERE id = $4 RETURNING *',
      [finalDisplayName, finalImage, JSON.stringify(finalTypes), numericId]
    );
    console.log('[updateCategory] Updated rows:', rows);
    return rows[0];
  } catch (e) {
    console.error('[updateCategory] Error:', e);
    throw e;
  }
};

const seedCategoriesIfEmpty = async () => {
  const p = getPool();
  const { rows } = await p.query('SELECT COUNT(*)::int AS c FROM categories');
  if (rows[0].c > 0) return;

  for (const cat of defaultCategories) {
    try {
      await addCategory(cat);
    } catch (e) {
      // Ignore duplicates (in case of race conditions)
      console.warn('[seedCategoriesIfEmpty] Skipping category:', cat.name, e.message);
    }
  }
  console.log('[seedCategoriesIfEmpty] Seeded default categories');
};

module.exports = {
  initCategoriesTable,
  listCategories,
  addCategory,
  deleteCategory,
  updateCategory,
  seedCategoriesIfEmpty,
  defaultCategories
};
