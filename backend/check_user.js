const { getPool } = require('./utils/productRepository');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkUser = async (email) => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE lower(email) = lower($1)', [email]);
    if (rows.length > 0) {
      console.log('User found:');
      console.log('ID:', rows[0].id);
      console.log('Email:', rows[0].email);
      console.log('Has Password Hash:', !!rows[0].password_hash);
    } else {
      console.log('User NOT found for email:', email);
    }
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    process.exit();
  }
};

const emailToCheck = process.argv[2] || 'hamzagujjarriaz60@gmail.com';
checkUser(emailToCheck);
