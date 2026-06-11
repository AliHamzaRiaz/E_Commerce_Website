// Try to require Prisma, fallback to local data if it fails
let prisma;
let useLocalData = true;
try {
  prisma = require('../backend/utils/prisma');
  useLocalData = false;
} catch (e) {
  console.log('Prisma not available, using local data');
  useLocalData = true;
}

const fallbackCategories = [
  { id: 1, name: "bra", displayName: "Bra" },
  { id: 2, name: "underwear", displayName: "Underwear" },
  { id: 3, name: "nightwear", displayName: "Nightwear" },
  { id: 4, name: "activewear", displayName: "Activewear" }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Try to get categories from Prisma Postgres
      if (!useLocalData && prisma) {
        const categories = await prisma.category.findMany();
        // If no categories in DB, seed default ones
        if (categories.length === 0) {
          for (const cat of fallbackCategories) {
            await prisma.category.create({ data: cat });
          }
          const seededCategories = await prisma.category.findMany();
          return res.status(200).json(seededCategories);
        }
        return res.status(200).json(categories);
      } else {
        return res.status(200).json(fallbackCategories);
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
      return res.status(200).json(fallbackCategories);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
