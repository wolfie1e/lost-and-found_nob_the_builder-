/**
 * Unit tests — Auth Middleware
 * Tests authenticate, adminOnly, and optionalAuth middleware
 */
const jwt = require('jsonwebtoken');

// Set env before requiring the module
process.env.JWT_SECRET = 'test_secret_for_unit_tests';
process.env.NODE_ENV = 'test';

const { authenticate, adminOnly, optionalAuth } = require('../../middleware/auth');
const { ApiError } = require('../../middleware/errorHandler');

const VALID_PAYLOAD = { id: 'user-1', email: 'test@campus.edu', name: 'Test User', role: 'student' };

function makeToken(payload = VALID_PAYLOAD, options = {}) {
    return jwt.sign(payload, 'test_secret_for_unit_tests', { expiresIn: '1h', ...options });
}

function makeReq(authHeader = '') {
    return { headers: { authorization: authHeader }, user: undefined };
}

describe('authenticate middleware', () => {
    test('calls next() with decoded user when valid Bearer token is provided', () => {
        const token = makeToken();
        const req = makeReq(`Bearer ${token}`);
        const next = jest.fn();
        authenticate(req, {}, next);
        expect(next).toHaveBeenCalledWith(); // called with no args = success
        expect(req.user).toMatchObject({ id: 'user-1', role: 'student' });
    });

    test('calls next(ApiError) when no Authorization header', () => {
        const req = makeReq('');
        const next = jest.fn();
        authenticate(req, {}, next);
        const err = next.mock.calls[0][0];
        expect(err).toBeInstanceOf(ApiError);
        expect(err.statusCode).toBe(401);
    });

    test('calls next(ApiError) when header is not Bearer', () => {
        const req = makeReq('Basic abc123');
        const next = jest.fn();
        authenticate(req, {}, next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(401);
    });

    test('calls next(ApiError) when token is expired', () => {
        const token = makeToken(VALID_PAYLOAD, { expiresIn: '-1s' });
        const req = makeReq(`Bearer ${token}`);
        const next = jest.fn();
        authenticate(req, {}, next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(401);
        expect(err.message).toMatch(/expired/i);
    });

    test('calls next(ApiError) when token is tampered', () => {
        const token = makeToken() + 'tampered';
        const req = makeReq(`Bearer ${token}`);
        const next = jest.fn();
        authenticate(req, {}, next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(401);
        expect(err.message).toMatch(/invalid token/i);
    });
});

describe('adminOnly middleware', () => {
    test('calls next() for admin users', () => {
        const req = { user: { role: 'admin' } };
        const next = jest.fn();
        adminOnly(req, {}, next);
        expect(next).toHaveBeenCalledWith();
    });

    test('calls next(ApiError 403) for non-admin users', () => {
        const req = { user: { role: 'student' } };
        const next = jest.fn();
        adminOnly(req, {}, next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
    });

    test('calls next(ApiError 403) when req.user is undefined', () => {
        const req = {};
        const next = jest.fn();
        adminOnly(req, {}, next);
        const err = next.mock.calls[0][0];
        expect(err.statusCode).toBe(403);
    });
});

describe('optionalAuth middleware', () => {
    test('calls next() and attaches user when valid token provided', () => {
        const token = makeToken();
        const req = makeReq(`Bearer ${token}`);
        const next = jest.fn();
        optionalAuth(req, {}, next);
        expect(next).toHaveBeenCalledWith();
        expect(req.user).toMatchObject({ id: 'user-1' });
    });

    test('calls next() without error when no token provided', () => {
        const req = makeReq('');
        const next = jest.fn();
        optionalAuth(req, {}, next);
        expect(next).toHaveBeenCalledWith();
        expect(req.user).toBeUndefined();
    });

    test('calls next() silently when token is invalid (does not block request)', () => {
        const req = makeReq('Bearer BADTOKEN');
        const next = jest.fn();
        optionalAuth(req, {}, next);
        expect(next).toHaveBeenCalledWith();
        expect(req.user).toBeUndefined();
    });
});
