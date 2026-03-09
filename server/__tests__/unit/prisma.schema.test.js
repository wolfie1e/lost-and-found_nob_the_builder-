/**
 * Unit tests — Prisma schema structure
 * Validates the schema definition without requiring a live DB
 * Tests that all required fields, enums, and indexes are defined
 */
const path = require('path');
const fs = require('fs');

const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf-8');

describe('Prisma Schema — User model', () => {
    test('schema file exists', () => {
        expect(fs.existsSync(schemaPath)).toBe(true);
    });

    test('defines User model', () => {
        expect(schema).toContain('model User {');
    });

    test('User has uuid primary key', () => {
        expect(schema).toMatch(/id\s+String\s+@id\s+@default\(uuid\(\)\)/);
    });

    test('User has unique email with index', () => {
        expect(schema).toContain('email        String   @unique');
        expect(schema).toContain('@@index([email])');
    });

    test('User has passwordHash field', () => {
        expect(schema).toContain('passwordHash String');
    });

    test('User has Role enum field', () => {
        expect(schema).toContain('role         Role');
    });

    test('User has createdAt and updatedAt timestamps', () => {
        expect(schema).toContain('@default(now())');
        expect(schema).toContain('@updatedAt');
    });

    test('User has relation to Item', () => {
        expect(schema).toContain('items     Item[]');
    });

    test('User has relation to AuditLog', () => {
        expect(schema).toContain('auditLogs AuditLog[]');
    });
});

describe('Prisma Schema — Role enum', () => {
    test('defines Role enum with STUDENT and ADMIN', () => {
        expect(schema).toContain('enum Role {');
        expect(schema).toContain('STUDENT');
        expect(schema).toContain('ADMIN');
    });
});

describe('Prisma Schema — Item model', () => {
    test('defines Item model', () => {
        expect(schema).toContain('model Item {');
    });

    test('Item has uuid primary key', () => {
        expect(schema).toContain("id          String    @id @default(uuid())");
    });

    test('Item has required type field (ItemType enum)', () => {
        expect(schema).toContain('type        ItemType');
    });

    test('Item has required title, location, and contact', () => {
        expect(schema).toContain('title       String');
        expect(schema).toContain('location    String');
        expect(schema).toContain('contact     String');
    });

    test('Item has optional description and imageUrl', () => {
        expect(schema).toContain('description String?');
        expect(schema).toContain('imageUrl    String?');
    });

    test('Item has resolved boolean with default false', () => {
        expect(schema).toContain('resolved    Boolean   @default(false)');
    });

    test('Item has category field with default OTHER', () => {
        expect(schema).toContain('category    Category  @default(OTHER)');
    });

    test('Item has performance indexes', () => {
        expect(schema).toContain('@@index([type])');
        expect(schema).toContain('@@index([resolved])');
        expect(schema).toContain('@@index([createdAt])');
        expect(schema).toContain('@@index([userId])');
        expect(schema).toContain('@@index([category])');
    });

    test('Item foreign key uses SetNull on user deletion', () => {
        expect(schema).toContain('onDelete: SetNull');
    });
});

describe('Prisma Schema — ItemType enum', () => {
    test('defines ItemType with LOST and FOUND', () => {
        expect(schema).toContain('enum ItemType {');
        expect(schema).toContain('LOST');
        expect(schema).toContain('FOUND');
    });
});

describe('Prisma Schema — Category enum', () => {
    const expectedCategories = ['KEYS', 'ELECTRONICS', 'CLOTHING', 'BAG', 'ID_CARD', 'WALLET', 'BOOK', 'SPORTS', 'OTHER'];

    test('defines Category enum', () => {
        expect(schema).toContain('enum Category {');
    });

    expectedCategories.forEach((cat) => {
        test(`Category enum contains ${cat}`, () => {
            expect(schema).toContain(cat);
        });
    });
});

describe('Prisma Schema — AuditLog model', () => {
    test('defines AuditLog model', () => {
        expect(schema).toContain('model AuditLog {');
    });

    test('AuditLog has action, entityId, and meta fields', () => {
        expect(schema).toContain('action    String');
        expect(schema).toContain('entityId  String?');
        expect(schema).toContain('meta      Json?');
    });

    test('AuditLog has appropriate indexes', () => {
        expect(schema).toContain('@@index([userId])');
        expect(schema).toContain('@@index([action])');
    });
});
