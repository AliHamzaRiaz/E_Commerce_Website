const { getPool } = require('./utils/productRepository');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const debugLogin = async (email, password) => {
  const pool = getPool();
  try {
    const { rows } = await pool.query('SELECT id, email, password_hash FROM users WHERE lower(email) = lower($1)', [email]);
    if (rows.length === 0) {
      console.log('User not found in DB');
      return;
    }
    const user = rows[0];
    console.log('User ID:', user.id);
    console.log('Stored Hash:', user.password_hash);
    console.log('Input Password:', password);
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log('Bcrypt Compare Result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match. Resetting password to "12345678" for debugging...');
      const newHash = await bcrypt.hash('12345678', 10);
      await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
      console.log('Password successfully reset to: 12345678');
    }
  } catch (err) {
    console.error('Debug error:', err.message);
  } finally {
    process.exit();
  }
};

const email = process.argv[2] || 'hamzagujjarriaz60@gmail.com';
const password = process.argv[3] || '12345677';
debugLogin(email, password);
