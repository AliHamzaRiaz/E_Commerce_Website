const { getPool } = require('./utils/productRepository');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const listUsers = async () => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT id, name, email, password_hash, created_at FROM users ORDER BY created_at DESC');
    
    if (rows.length === 0) {
      console.log('No users found in the database.');
      return;
    }

    console.log('--- REGISTERED USERS ---');
    console.log('');
    
    rows.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Hash:  ${user.password_hash}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('------------------------');
    });

  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    process.exit();
  }
};

listUsers();
