/**
 * Integration tests — Items API
 * Tests full HTTP request/response cycle for all item endpoints
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');

// Set env before app boots
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_integration_secret';
process.env.PORT = '0'; // Use ephemeral port
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

const app = require('../../app');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeAuthHeader(role = 'student', userId = 'user-test-1') {
    const token = jwt.sign(
        { id: userId, email: 'test@campus.edu', name: 'Test User', role },
        'test_integration_secret',
        { expiresIn: '1h' }
    );
    return `Bearer ${token}`;
}

// ─── Test State ───────────────────────────────────────────────────────────────
let server;

beforeAll((done) => {
    server = app.listen(0, done);
});

afterAll((done) => {
    server.close(done);
});

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('GET /api/health', () => {
    test('returns 200 with status ok', async () => {
        const res = await request(server).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
    });
});

// ─── GET /api/items ───────────────────────────────────────────────────────────
describe('GET /api/items', () => {
    test('returns 200 with paginated data envelope', async () => {
        const res = await request(server).get('/api/items');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.meta).toMatchObject({
            total: expect.any(Number),
            page: 1,
            limit: expect.any(Number),
            totalPages: expect.any(Number),
        });
    });

    test('filters by type=lost', async () => {
        const res = await request(server).get('/api/items?type=lost');
        expect(res.status).toBe(200);
        res.body.data.forEach((item) => expect(item.type).toBe('lost'));
    });

    test('filters by type=found', async () => {
        const res = await request(server).get('/api/items?type=found');
        expect(res.status).toBe(200);
        res.body.data.forEach((item) => expect(item.type).toBe('found'));
    });

    test('supports keyword search via ?q=', async () => {
        const res = await request(server).get('/api/items?q=Umbrella');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('supports pagination via ?page=1&limit=1', async () => {
        const res = await request(server).get('/api/items?page=1&limit=1');
        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(1);
        expect(res.body.meta.limit).toBe(1);
    });

    test('ignores invalid type filters', async () => {
        const res = await request(server).get('/api/items?type=invalid_type');
        expect(res.status).toBe(200);
        // Should still return all items (no filter applied for invalid value)
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

// ─── POST /api/items ──────────────────────────────────────────────────────────
describe('POST /api/items', () => {
    const validItem = {
        type: 'lost',
        title: 'Red Notebook',
        description: 'Has my name on the cover',
        location: 'Science Block Room 204',
        contact: 'redbook@campus.edu',
        category: 'book',
    };

    test('returns 401 when no auth token provided', async () => {
        const res = await request(server).post('/api/items').send(validItem);
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
    });

    test('returns 201 and created item when authenticated', async () => {
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send(validItem);
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('ok');
        expect(res.body.data).toMatchObject({
            type: 'lost',
            title: 'Red Notebook',
            location: 'Science Block Room 204',
        });
        expect(res.body.data.id).toBeDefined();
        expect(res.body.data.date).toBeDefined();
    });

    test('returns 400 when type is invalid', async () => {
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send({ ...validItem, type: 'stolen' });
        expect(res.status).toBe(400);
        const fields = res.body.errors?.map((e) => e.field);
        expect(fields).toContain('type');
    });

    test('returns 400 when title is missing', async () => {
        const { title, ...rest } = validItem;
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send(rest);
        expect(res.status).toBe(400);
        const fields = res.body.errors?.map((e) => e.field);
        expect(fields).toContain('title');
    });

    test('returns 400 when location is missing', async () => {
        const { location, ...rest } = validItem;
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send(rest);
        expect(res.status).toBe(400);
    });

    test('returns 400 when contact is missing', async () => {
        const { contact, ...rest } = validItem;
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send(rest);
        expect(res.status).toBe(400);
    });

    test('returns 400 when title exceeds 100 chars', async () => {
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send({ ...validItem, title: 'X'.repeat(101) });
        expect(res.status).toBe(400);
    });
});

// ─── GET /api/items/:id ───────────────────────────────────────────────────────
describe('GET /api/items/:id', () => {
    let itemId;

    beforeAll(async () => {
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader())
            .send({ type: 'found', title: 'Purple Pen', location: 'Library', contact: 'pen@campus.edu' });
        itemId = res.body.data.id;
    });

    test('returns 200 with item data for valid id', async () => {
        const res = await request(server).get(`/api/items/${itemId}`);
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(itemId);
        expect(res.body.data.title).toBe('Purple Pen');
    });

    test('returns 404 for non-existent id', async () => {
        const res = await request(server).get('/api/items/non-existent-id-xyz');
        expect(res.status).toBe(404);
        expect(res.body.status).toBe('error');
    });
});

// ─── PATCH /api/items/:id/resolve ────────────────────────────────────────────
describe('PATCH /api/items/:id/resolve', () => {
    let itemId;
    const userId = 'patch-test-user-1';

    beforeAll(async () => {
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader('student', userId))
            .send({ type: 'lost', title: 'Test Resolve Item', location: 'Library', contact: 'a@b.com' });
        itemId = res.body.data.id;
    });

    test('returns 401 without auth token', async () => {
        const res = await request(server).patch(`/api/items/${itemId}/resolve`);
        expect(res.status).toBe(401);
    });

    test('returns 200 and marks item resolved for owner', async () => {
        const res = await request(server)
            .patch(`/api/items/${itemId}/resolve`)
            .set('Authorization', makeAuthHeader('student', userId));
        expect(res.status).toBe(200);
        expect(res.body.data.resolved).toBe(true);
        expect(res.body.data.resolvedAt).toBeDefined();
    });

    test('returns 404 for non-existent item', async () => {
        const res = await request(server)
            .patch('/api/items/ghost-id/resolve')
            .set('Authorization', makeAuthHeader());
        expect(res.status).toBe(404);
    });

    test('admin can resolve any item regardless of owner', async () => {
        // Create a new item as a different user
        const createRes = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader('student', 'other-user'))
            .send({ type: 'found', title: 'Admin Resolve Test', location: 'Location X', contact: 'contactX@campus.edu' });
        const id = createRes.body.data.id;

        const res = await request(server)
            .patch(`/api/items/${id}/resolve`)
            .set('Authorization', makeAuthHeader('admin', 'admin-user'));
        expect(res.status).toBe(200);
        expect(res.body.data.resolved).toBe(true);
    });
});

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────
describe('DELETE /api/items/:id', () => {
    let itemId;
    const userId = 'delete-user-1';

    beforeAll(async () => {
        const res = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader('student', userId))
            .send({ type: 'lost', title: 'Delete Me', location: 'Gym', contact: 'del@campus.edu' });
        itemId = res.body.data.id;
    });

    test('returns 401 without auth token', async () => {
        const res = await request(server).delete(`/api/items/${itemId}`);
        expect(res.status).toBe(401);
    });

    test('returns 403 when a different user tries to delete', async () => {
        const res = await request(server)
            .delete(`/api/items/${itemId}`)
            .set('Authorization', makeAuthHeader('student', 'different-user-999'));
        expect(res.status).toBe(403);
    });

    test('returns 204 when owner deletes their item', async () => {
        const res = await request(server)
            .delete(`/api/items/${itemId}`)
            .set('Authorization', makeAuthHeader('student', userId));
        expect(res.status).toBe(204);
    });

    test('returns 404 after item is deleted', async () => {
        const res = await request(server).get(`/api/items/${itemId}`);
        expect(res.status).toBe(404);
    });

    test('admin can delete any item', async () => {
        const createRes = await request(server)
            .post('/api/items')
            .set('Authorization', makeAuthHeader('student', 'some-user'))
            .send({ type: 'found', title: 'Admin Will Delete', location: 'Location Z', contact: 'contactZ@campus.edu' });
        const id = createRes.body.data.id;

        const res = await request(server)
            .delete(`/api/items/${id}`)
            .set('Authorization', makeAuthHeader('admin', 'admin-1'));
        expect(res.status).toBe(204);
    });
});

// ─── 404 Route ────────────────────────────────────────────────────────────────
describe('Unknown routes', () => {
    test('returns 404 for undefined route', async () => {
        const res = await request(server).get('/api/nonexistent-route');
        expect(res.status).toBe(404);
    });
});
