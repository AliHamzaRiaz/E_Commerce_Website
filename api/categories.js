const fallbackCategories = [
  { id: 1, name: "bra", displayName: "Bra" },
  { id: 2, name: "underwear", displayName: "Underwear" },
  { id: 3, name: "nightwear", displayName: "Nightwear" },
  { id: 4, name: "activewear", displayName: "Activewear" }
];

let prisma;
let useLocalData = true;

// Try to initialize Prisma Client
try {
  prisma = require('../backend/utils/prisma');
  useLocalData = false;
  console.log('✅ Prisma Client initialized successfully (categories)');
} catch (error) {
  console.warn('⚠️ Prisma Client not available, using fallback categories');
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
        console.log('📦 Fetching categories from database...');
        
        // Get all categories from DB
        let categories = await prisma.category.findMany();
        console.log(`✅ Found ${categories.length} categories in DB`);
        
        // If DB is empty, seed it with default categories
        if (categories.length === 0) {
          console.log('🗄️ DB is empty—seeding with default categories');
          for (const cat of fallbackCategories) {
            await prisma.category.create({ data: cat });
          }
          categories = await prisma.category.findMany();
        }
        
        return res.status(200).json(categories);
      } else {
        // Fallback to local data
        console.log('📦 Using fallback categories data');
        return res.status(200).json(fallbackCategories);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      // If DB fails, use fallback data
      console.log('📦 Using fallback categories data due to error');
      return res.status(200).json(fallbackCategories);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
