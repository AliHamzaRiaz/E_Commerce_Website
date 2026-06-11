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

const defaultProducts = [
  {
    id: "1",
    name: "Lace Bralette",
    description: "Beautiful lace bralette",
    price: 39.99,
    originalPrice: 59.99,
    discount: "33% OFF",
    category: "bra",
    colors: ["black", "nude"],
    sizes: ["S", "M", "L"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
    available: true,
    stock: 50
  },
  {
    id: "2",
    name: "Silk Panties",
    description: "Luxurious silk panties",
    price: 24.99,
    originalPrice: 34.99,
    discount: "28% OFF",
    category: "underwear",
    colors: ["white", "pink"],
    sizes: ["XS", "S", "M"],
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
    available: true,
    stock: 30
  }
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
      // Try to get products from Prisma Postgres
      if (!useLocalData && prisma) {
        const products = await prisma.product.findMany();
        // If no products in DB, seed default ones
        if (products.length === 0) {
          for (const prod of defaultProducts) {
            await prisma.product.create({ data: prod });
          }
          const seededProducts = await prisma.product.findMany();
          return res.status(200).json(seededProducts);
        }
        return res.status(200).json(products);
      } else {
        return res.status(200).json(defaultProducts);
      }
    } catch (e) {
      console.error('Error fetching products:', e);
      return res.status(200).json(defaultProducts);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
