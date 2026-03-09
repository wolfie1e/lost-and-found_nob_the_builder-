const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../validators/item.validator');
const { registerRules, loginRules } = require('../validators/auth.validator');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── In-memory user store (Phase 5: replace with Prisma) ──────────────────
let users = [];

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post(
    '/register',
    authLimiter,
    validate(registerRules),
    catchAsync(async (req, res) => {
        const { name, email, password } = req.body;

        const existing = users.find((u) => u.email === email);
        if (existing) throw ApiError.badRequest('An account with this email already exists.');

        const passwordHash = await bcrypt.hash(password, 12);
        const user = {
            id: uuidv4(),
            name,
            email,
            passwordHash,
            role: 'student',   // First user can be made admin manually
            createdAt: new Date().toISOString(),
        };
        users.push(user);

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            status: 'ok',
            data: {
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
            },
        });
    })
);

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post(
    '/login',
    authLimiter,
    validate(loginRules),
    catchAsync(async (req, res) => {
        const { email, password } = req.body;

        const user = users.find((u) => u.email === email);
        if (!user) throw ApiError.unauthorized('Invalid email or password.');

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw ApiError.unauthorized('Invalid email or password.');

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            status: 'ok',
            data: {
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
            },
        });
    })
);

// ─── GET /api/auth/me — get current user from token ───────────────────────
router.get('/me', authenticate, (req, res) => {
    const user = users.find((u) => u.id === req.user.id);
    if (!user) throw ApiError.notFound('User not found.');
    res.json({
        status: 'ok',
        data: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});

// ─── POST /api/auth/logout — client-side only (stateless JWT) ─────────────
router.post('/logout', authenticate, (req, res) => {
    // Stateless JWT: actual token invalidation requires a denylist (Redis, Phase 5+)
    res.json({ status: 'ok', message: 'Logged out successfully.' });
});

module.exports = { router, getUsers: () => users };
