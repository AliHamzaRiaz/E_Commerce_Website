const { PrismaClient } = require('@prisma/client');

// Use DATABASE_URL or POSTGRES_URL (Vercel Postgres uses POSTGRES_URL)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
