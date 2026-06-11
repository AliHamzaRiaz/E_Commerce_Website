const { PrismaClient } = require('@prisma/client');

// Create Prisma Client instance
const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

module.exports = prisma;
