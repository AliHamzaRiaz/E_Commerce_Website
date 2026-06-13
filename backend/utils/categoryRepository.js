const { getPool } = require('./productRepository');

const initCategoriesTable = async () => {
  const p = getPool();
  if (!p) {
    console.log('⚠️ No database available, skipping categories table init');
    return;
  }
  try {
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
  } catch (e) {
    console.error('❌ Failed to init categories table:', e);
  }
};

const listCategories = async () => {
  const p = getPool();
  if (!p) {
    console.log('⚠️ No database available, returning empty array');
    return [];
  }
  try {
    const { rows } = await p.query('SELECT * FROM categories ORDER BY display_name ASC');
    console.log('[listCategories] Raw rows from DB:', rows);
    const mapped = rows.map(row => {
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
    return mapped;
  } catch (e) {
    console.error('❌ Database query failed, returning empty array:', e);
    return [];
  }
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

module.exports = {
  initCategoriesTable,
  listCategories,
  addCategory,
  deleteCategory,
  updateCategory
};
