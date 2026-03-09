const { PrismaClient } = require('@prisma/client');
const { NODE_ENV } = require('./env');

// Prevent multiple Prisma instances in development (hot reload issue)
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});

if (NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

module.exports = prisma;
