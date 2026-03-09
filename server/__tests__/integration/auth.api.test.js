/**
 * Integration tests — Auth API
 * Tests /api/auth/register, /login, /me, /logout
 */
const request = require('supertest');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_integration_secret';
process.env.PORT = '0';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

const app = require('../../app');

let server;
beforeAll((done) => { server = app.listen(0, done); });
afterAll((done) => { server.close(done); });

// ─── Register ─────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
    const newUser = {
        name: 'John Test',
        email: `testuser_${Date.now()}@campus.edu`, // unique email per run
        password: 'Password1',
    };

    test('returns 201 with JWT token and user data', async () => {
        const res = await request(server).post('/api/auth/register').send(newUser);
        expect(res.status).toBe(201);
        expect(res.body.status).toBe('ok');
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user).toMatchObject({
            name: newUser.name,
            email: newUser.email,
            role: 'student',
        });
        // Should NOT return passwordHash
        expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    test('returns valid JWT that can be decoded', async () => {
        const email = `decode_${Date.now()}@campus.edu`;
        const res = await request(server).post('/api/auth/register').send({
            name: 'Decode Test', email, password: 'Password1',
        });
        const decoded = jwt.verify(res.body.data.token, 'test_integration_secret');
        expect(decoded.email).toBe(email);
        expect(decoded.role).toBe('student');
    });

    test('returns 400 when email is already registered', async () => {
        // Register twice with same email
        const email = `dup_${Date.now()}@campus.edu`;
        await request(server).post('/api/auth/register').send({ name: 'First', email, password: 'Password1' });
        const res = await request(server).post('/api/auth/register').send({ name: 'Second', email, password: 'Password1' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already exists/i);
    });

    test('returns 400 with validation errors for missing fields', async () => {
        const res = await request(server).post('/api/auth/register').send({ name: 'No Password' });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
    });

    test('returns 400 when password is too weak', async () => {
        const res = await request(server).post('/api/auth/register').send({
            name: 'Weak Pass', email: `weak_${Date.now()}@campus.edu`, password: 'weak',
        });
        expect(res.status).toBe(400);
        const fields = res.body.errors?.map((e) => e.field);
        expect(fields).toContain('password');
    });

    test('returns 400 when email format is invalid', async () => {
        const res = await request(server).post('/api/auth/register').send({
            name: 'Bad Email', email: 'not-an-email', password: 'Password1',
        });
        expect(res.status).toBe(400);
        const fields = res.body.errors?.map((e) => e.field);
        expect(fields).toContain('email');
    });
});

// ─── Login ────────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
    const creds = {
        name: 'Login Test User',
        email: `login_${Date.now()}@campus.edu`,
        password: 'Password1',
    };

    beforeAll(async () => {
        await request(server).post('/api/auth/register').send(creds);
    });

    test('returns 200 with JWT token for valid credentials', async () => {
        const res = await request(server).post('/api/auth/login').send({
            email: creds.email, password: creds.password,
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe(creds.email);
    });

    test('returns 401 for wrong password', async () => {
        const res = await request(server).post('/api/auth/login').send({
            email: creds.email, password: 'WrongPassword99',
        });
        expect(res.status).toBe(401);
        expect(res.body.message).toMatch(/invalid email or password/i);
    });

    test('returns 401 for non-existent email', async () => {
        const res = await request(server).post('/api/auth/login').send({
            email: 'ghost@campus.edu', password: 'Password1',
        });
        expect(res.status).toBe(401);
    });

    test('does NOT reveal whether email exists (same 401 for both)', async () => {
        const wrongPass = await request(server).post('/api/auth/login').send({
            email: creds.email, password: 'Wrong1Pass',
        });
        const noUser = await request(server).post('/api/auth/login').send({
            email: 'nonexistent9999@campus.edu', password: 'Password1',
        });
        // Same status and same message structure
        expect(wrongPass.status).toBe(noUser.status);
        expect(wrongPass.body.message).toBe(noUser.body.message);
    });

    test('returns 400 for missing email', async () => {
        const res = await request(server).post('/api/auth/login').send({ password: 'Password1' });
        expect(res.status).toBe(400);
    });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────
describe('GET /api/auth/me', () => {
    let token;
    let userEmail;

    beforeAll(async () => {
        userEmail = `me_${Date.now()}@campus.edu`;
        const res = await request(server).post('/api/auth/register').send({
            name: 'Me Test', email: userEmail, password: 'Password1',
        });
        token = res.body.data.token;
    });

    test('returns 200 with current user data for valid token', async () => {
        const res = await request(server)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(userEmail);
        expect(res.body.data.role).toBe('student');
        expect(res.body.data.passwordHash).toBeUndefined();
    });

    test('returns 401 without token', async () => {
        const res = await request(server).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    test('returns 401 with malformed token', async () => {
        const res = await request(server)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer definitely.not.valid.jwt');
        expect(res.status).toBe(401);
    });
});

// ─── POST /logout ─────────────────────────────────────────────────────────────
describe('POST /api/auth/logout', () => {
    let token;

    beforeAll(async () => {
        const email = `logout_${Date.now()}@campus.edu`;
        const res = await request(server).post('/api/auth/register').send({
            name: 'Logout Test', email, password: 'Password1',
        });
        token = res.body.data.token;
    });

    test('returns 200 for authenticated logout', async () => {
        const res = await request(server)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('returns 401 for unauthenticated logout', async () => {
        const res = await request(server).post('/api/auth/logout');
        expect(res.status).toBe(401);
    });
});
