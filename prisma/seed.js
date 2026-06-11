const { PrismaClient } = require('@prisma/client');
const { defaultProducts } = require('../backend/data/defaultProducts');

const prisma = new PrismaClient();

const fallbackCategories = [
  { id: 1, name: "bra", displayName: "Bra" },
  { id: 2, name: "underwear", displayName: "Underwear" },
  { id: 3, name: "nightwear", displayName: "Nightwear" },
  { id: 4, name: "activewear", displayName: "Activewear" }
];

async function main() {
  console.log('Starting safe seed... (will NOT delete existing data!)');

  // Seed Categories - ONLY add missing ones
  for (const cat of fallbackCategories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {}, // Don't change existing categories
      create: cat, // Only create if missing
    });
  }
  console.log('✅ Categories processed (kept existing, added missing)');

  // Seed Products - ONLY add missing ones
  for (const prod of defaultProducts) {
    const productId = String(prod.id);
    await prisma.product.upsert({
      where: { id: productId },
      update: {}, // Don't change existing products
      create: {
        ...prod,
        id: productId,
      }, // Only create if missing
    });
  }
  console.log('✅ Products processed (kept existing, added missing)');

  console.log('🎉 Safe seed complete! No data was deleted.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
