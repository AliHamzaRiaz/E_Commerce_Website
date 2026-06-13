const { getPool } = require('./productRepository');

const initUsersTable = async () => {
  const p = getPool();
  
  // First ensure table exists with basic columns
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      favorites_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      cart_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // Explicitly add missing columns if they don't exist (migration)
  try {
    await p.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;`);
    await p.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;`);
    console.log('User table columns verified');
  } catch (err) {
    console.error('Migration error:', err.message);
  }

  await p.query(`CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));`);
};

const rowToUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  favorites: Array.isArray(row.favorites_json) ? row.favorites_json : [],
  cart: Array.isArray(row.cart_json) ? row.cart_json : [],
  resetToken: row.reset_token,
  resetTokenExpiry: row.reset_token_expiry ? new Date(row.reset_token_expiry).toISOString() : null,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
});

const createUser = async ({ id, name, email, passwordHash }) => {
  const p = getPool();
  const { rows } = await p.query(
    `INSERT INTO users (id, name, email, password_hash)
     VALUES ($1, $2, lower($3), $4)
     RETURNING id, name, email, favorites_json, cart_json, reset_token, reset_token_expiry, created_at`,
    [String(id), String(name), String(email), String(passwordHash)]
  );
  return rowToUser(rows[0]);
};

const findUserWithPasswordByEmail = async (email) => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, name, email, password_hash, favorites_json, cart_json, reset_token, reset_token_expiry, created_at
     FROM users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [String(email || '').trim()]
  );
  if (!rows[0]) return null;
  return {
    ...rowToUser(rows[0]),
    passwordHash: rows[0].password_hash,
  };
};

const findUserByResetToken = async (token) => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, name, email, password_hash, favorites_json, cart_json, reset_token, reset_token_expiry, created_at
     FROM users
     WHERE reset_token = $1 AND reset_token_expiry > now()
     LIMIT 1`,
    [String(token)]
  );
  if (!rows[0]) return null;
  return {
    ...rowToUser(rows[0]),
    passwordHash: rows[0].password_hash,
  };
};

const findUserById = async (id) => {
  const p = getPool();
  const { rows } = await p.query(
    `SELECT id, name, email, favorites_json, cart_json, reset_token, reset_token_expiry, created_at
     FROM users
     WHERE id = $1
     LIMIT 1`,
    [String(id)]
  );
  return rows[0] ? rowToUser(rows[0]) : null;
};

const updateUserResetToken = async (email, token, expiry) => {
  const p = getPool();
  const res = await p.query(
    `UPDATE users SET reset_token = $2, reset_token_expiry = $3 WHERE lower(email) = lower($1) RETURNING id`,
    [String(email), token, expiry]
  );
  console.log('[updateUserResetToken] Update result rows:', res.rowCount);
};

const updateUserPassword = async (id, passwordHash) => {
  const p = getPool();
  const res = await p.query(
    `UPDATE users SET password_hash = $2, reset_token = NULL, reset_token_expiry = NULL WHERE id = $1 RETURNING id`,
    [String(id), String(passwordHash)]
  );
  console.log('[updateUserPassword] Update result rows:', res.rowCount);
};

const updateUserFavorites = async (id, favorites) => {
  const p = getPool();
  await p.query(`UPDATE users SET favorites_json = $2::jsonb WHERE id = $1`, [
    String(id),
    JSON.stringify(Array.isArray(favorites) ? favorites : []),
  ]);
};

const updateUserCart = async (id, cart) => {
  const p = getPool();
  await p.query(`UPDATE users SET cart_json = $2::jsonb WHERE id = $1`, [
    String(id),
    JSON.stringify(Array.isArray(cart) ? cart : []),
  ]);
};

module.exports = {
  initUsersTable,
  createUser,
  findUserWithPasswordByEmail,
  findUserById,
  findUserByResetToken,
  updateUserResetToken,
  updateUserPassword,
  updateUserFavorites,
  updateUserCart,
};
