/**
 * Prisma seed script — run with: npx prisma db seed
 * Seeds an admin user and two sample items for development.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Admin user
    const admin = await prisma.user.upsert({
        where: { email: 'admin@campus.edu' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@campus.edu',
            passwordHash: await bcrypt.hash('Admin1234', 12),
            role: 'ADMIN',
        },
    });
    console.log(`✅ Admin user: ${admin.email}`);

    // Sample student
    const student = await prisma.user.upsert({
        where: { email: 'student@campus.edu' },
        update: {},
        create: {
            name: 'Alex Student',
            email: 'student@campus.edu',
            passwordHash: await bcrypt.hash('Student12', 12),
            role: 'STUDENT',
        },
    });
    console.log(`✅ Student user: ${student.email}`);

    // Sample items
    await prisma.item.createMany({
        skipDuplicates: true,
        data: [
            {
                type: 'LOST',
                title: 'Blue Umbrella',
                description: 'Left at the lobby near the entrance',
                location: 'Main Lobby',
                contact: 'student@campus.edu',
                category: 'OTHER',
                userId: student.id,
            },
            {
                type: 'FOUND',
                title: 'Black Wallet',
                description: 'Found on the bench outside. Has some cards inside.',
                location: 'East Garden',
                contact: 'admin@campus.edu',
                category: 'WALLET',
                userId: admin.id,
            },
        ],
    });
    console.log('✅ Sample items created.');
    console.log('🎉 Seed complete!');
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
