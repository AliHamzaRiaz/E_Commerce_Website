const { getPool } = require('./utils/productRepository');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const seedAdmin = async () => {
  const pool = getPool();
  try {
    const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || '');
    const adminPasswordHash = String(process.env.ADMIN_PASSWORD_HASH || '');

    if (!adminEmail) {
      console.log('ADMIN_EMAIL not set in .env');
      return;
    }

    const { rows } = await pool.query('SELECT id FROM users WHERE lower(email) = lower($1)', [adminEmail]);
    
    let hash = adminPasswordHash;
    if (!hash && adminPassword) {
      hash = await bcrypt.hash(adminPassword, 10);
    }

    if (rows.length === 0) {
      console.log('Seeding admin into users table...');
      await pool.query(
        'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)',
        ['ADM-INITIAL', 'Admin', adminEmail, hash]
      );
      console.log('Admin seeded successfully');
    } else {
      console.log('Admin already exists in users table. Updating password hash...');
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE lower(email) = lower($2)',
        [hash, adminEmail]
      );
      console.log('Admin password updated');
    }
  } catch (err) {
    console.error('Seed Admin error:', err.message);
  } finally {
    process.exit();
  }
};

seedAdmin();
