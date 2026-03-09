/**
 * Unit tests — Item Validator
 * Tests all validation rules for POST /api/items
 */
const { validationResult } = require('express-validator');
const { createItemRules } = require('../../validators/item.validator');

/**
 * Helper: run express-validator rules against a mock request body
 */
async function runValidation(body) {
    const req = { body, headers: {}, params: {}, query: {} };
    const res = {};
    await Promise.all(createItemRules.map((rule) => rule.run(req)));
    return validationResult(req);
}

describe('Item Validator — createItemRules', () => {
    // ─── VALID PAYLOAD ──────────────────────────────────────────────────────────
    describe('valid payloads', () => {
        test('accepts a fully valid item', async () => {
            const result = await runValidation({
                type: 'lost',
                title: 'Blue Backpack',
                description: 'Left in the library',
                location: 'Main Library Floor 2',
                contact: 'student@campus.edu',
                category: 'bag',
            });
            expect(result.isEmpty()).toBe(true);
        });

        test('accepts item without optional description and category', async () => {
            const result = await runValidation({
                type: 'found',
                title: 'Student ID',
                location: 'Cafeteria',
                contact: '9876543210',
            });
            expect(result.isEmpty()).toBe(true);
        });
    });

    // ─── TYPE VALIDATION ────────────────────────────────────────────────────────
    describe('type field', () => {
        test('rejects missing type', async () => {
            const result = await runValidation({ title: 'Keys', location: 'Lobby', contact: 'a@b.com' });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('type');
        });

        test('rejects invalid type value', async () => {
            const result = await runValidation({ type: 'stolen', title: 'Keys', location: 'Lobby', contact: 'a@b.com' });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('type');
        });

        test('accepts "lost"', async () => {
            const result = await runValidation({ type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b.com' });
            const err = result.array().find((e) => e.path === 'type');
            expect(err).toBeUndefined();
        });

        test('accepts "found"', async () => {
            const result = await runValidation({ type: 'found', title: 'Keys', location: 'Lobby', contact: 'a@b.com' });
            const err = result.array().find((e) => e.path === 'type');
            expect(err).toBeUndefined();
        });
    });

    // ─── TITLE VALIDATION ───────────────────────────────────────────────────────
    describe('title field', () => {
        test('rejects missing title', async () => {
            const result = await runValidation({ type: 'lost', location: 'Lobby', contact: 'a@b.com' });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('title');
        });

        test('rejects title shorter than 2 characters', async () => {
            const result = await runValidation({ type: 'lost', title: 'A', location: 'Lobby', contact: 'a@b.com' });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('title');
        });

        test('rejects title longer than 100 characters', async () => {
            const result = await runValidation({
                type: 'lost',
                title: 'A'.repeat(101),
                location: 'Lobby',
                contact: 'a@b.com',
            });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('title');
        });

        test('accepts title of exactly 2 characters', async () => {
            const result = await runValidation({ type: 'lost', title: 'AB', location: 'Lobby', contact: 'a@b.com' });
            const err = result.array().find((e) => e.path === 'title');
            expect(err).toBeUndefined();
        });
    });

    // ─── DESCRIPTION VALIDATION ─────────────────────────────────────────────────
    describe('description field', () => {
        test('accepts missing description (optional)', async () => {
            const result = await runValidation({ type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b.com' });
            const err = result.array().find((e) => e.path === 'description');
            expect(err).toBeUndefined();
        });

        test('rejects description over 1000 characters', async () => {
            const result = await runValidation({
                type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b.com',
                description: 'X'.repeat(1001),
            });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('description');
        });
    });

    // ─── LOCATION VALIDATION ─────────────────────────────────────────────────
    describe('location field', () => {
        test('rejects missing location', async () => {
            const result = await runValidation({ type: 'lost', title: 'Keys', contact: 'a@b.com' });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('location');
        });

        test('rejects location over 200 characters', async () => {
            const result = await runValidation({
                type: 'lost', title: 'Keys', contact: 'a@b.com',
                location: 'B'.repeat(201),
            });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('location');
        });
    });

    // ─── CONTACT VALIDATION ──────────────────────────────────────────────────
    describe('contact field', () => {
        test('rejects missing contact', async () => {
            const result = await runValidation({ type: 'lost', title: 'Keys', location: 'Lobby' });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('contact');
        });

        test('rejects contact shorter than 5 characters', async () => {
            const result = await runValidation({
                type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b',
            });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('contact');
        });
    });

    // ─── CATEGORY VALIDATION ─────────────────────────────────────────────────
    describe('category field (optional)', () => {
        test('accepts valid category', async () => {
            const result = await runValidation({
                type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b.com', category: 'keys',
            });
            const err = result.array().find((e) => e.path === 'category');
            expect(err).toBeUndefined();
        });

        test('rejects invalid category', async () => {
            const result = await runValidation({
                type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b.com', category: 'spaceship',
            });
            const errors = result.array().map((e) => e.path);
            expect(errors).toContain('category');
        });

        test('accepts absent category (optional)', async () => {
            const result = await runValidation({ type: 'lost', title: 'Keys', location: 'Lobby', contact: 'a@b.com' });
            const err = result.array().find((e) => e.path === 'category');
            expect(err).toBeUndefined();
        });
    });
});
