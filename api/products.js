const { defaultProducts } = require('../backend/data/defaultProducts');

let prisma;
let useLocalData = true;

// Try to initialize Prisma Client
try {
  // We can't use require in Vercel's edge runtime, so wrap in try/catch
  prisma = require('../backend/utils/prisma');
  useLocalData = false;
  console.log('✅ Prisma Client initialized successfully');
} catch (error) {
  console.warn('⚠️ Prisma Client not available, using fallback data');
  console.warn('Error:', error.message);
  useLocalData = true;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // First, try to use Prisma
      if (!useLocalData && prisma) {
        console.log('📦 Fetching products from database...');
        
        // Get all products from DB
        let products = await prisma.product.findMany();
        console.log(`✅ Found ${products.length} products in DB`);
        
        // If DB is empty, seed it with default products
        if (products.length === 0) {
          console.log('🗄️ DB is empty—seeding with default products');
          for (const prod of defaultProducts) {
            await prisma.product.create({
              data: {
                ...prod,
                id: String(prod.id),
              },
            });
          }
          products = await prisma.product.findMany();
        }
        
        return res.status(200).json(products);
      } else {
        // Fallback to local data
        console.log('📦 Using fallback product data');
        return res.status(200).json(defaultProducts);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      // If DB fails, use fallback data
      console.log('📦 Using fallback product data due to error');
      return res.status(200).json(defaultProducts);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
