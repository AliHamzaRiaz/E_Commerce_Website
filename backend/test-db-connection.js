const path = require("path");
const dotenv = require("dotenv");

// Load .env files
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, ".env") });

const pool = require("./utils/db");

async function testConnection() {
  try {
    console.log("Testing database connection...");
    
    // Test the connection
    const client = await pool.connect();
    console.log("✅ Successfully connected to Neon PostgreSQL database!");
    
    // Test a simple query
    const result = await client.query("SELECT NOW()");
    console.log("📅 Database time:", result.rows[0].now);
    
    // List tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("📊 Tables in database:", tablesResult.rows.map(r => r.table_name));
    
    client.release();
    console.log("Connection test complete!");
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Error details:", error);
  } finally {
    // Close the pool to exit the script
    await pool.end();
  }
}

testConnection();
