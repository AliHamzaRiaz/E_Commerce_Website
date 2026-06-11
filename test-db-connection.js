const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

console.log('🔍 Checking database connection...');
console.log('DATABASE_URL from .env:', process.env.DATABASE_URL);
console.log('POSTGRES_URL from .env:', process.env.POSTGRES_URL);

const prisma = new PrismaClient({
  log: ['info', 'query', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('\n🚀 Trying to connect to database...');
    await prisma.$connect();
    console.log('✅ SUCCESS: Database connected!');

    // Try to fetch some data to confirm it's working
    console.log('\n📦 Fetching products...');
    const products = await prisma.product.findMany();
    console.log(`✅ Found ${products.length} products!`);
    if (products.length > 0) {
      console.log('First product:', products[0].name);
    }

    console.log('\n📦 Fetching categories...');
    const categories = await prisma.category.findMany();
    console.log(`✅ Found ${categories.length} categories!`);

    console.log('\n📦 Fetching orders...');
    const orders = await prisma.order.findMany();
    console.log(`✅ Found ${orders.length} orders!`);

    console.log('\n🎉 Database connection test complete!');
  } catch (error) {
    console.error('❌ ERROR: Could not connect to database!');
    console.error('Error details:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
