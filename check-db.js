
const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkDB() {
  try {
    console.log('✅ Connected to DB!');

    // 1. Get all table info
    console.log('\n📋 TABLE INFORMATION:');
    const tablesRes = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);
    console.table(tablesRes.rows);

    // 2. Get first 3 orders raw
    console.log('\n📦 FIRST 3 ORDERS RAW DATA:');
    const ordersRes = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 3');
    for (let i = 0; i < ordersRes.rows.length; i++) {
      console.log(`\n--- ORDER ${i + 1} ---`);
      console.log(JSON.stringify(ordersRes.rows[i], null, 2));
    }

    pool.end();
  } catch (err) {
    console.error('❌ ERROR:', err.message);
    console.error(err.stack);
    pool.end();
  }
}

checkDB();
