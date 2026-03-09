const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { ApiError } = require('./errorHandler');

/**
 * Verifies JWT from Authorization header.
 * Attaches req.user = { id, email, name, role }
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(ApiError.unauthorized('Authentication required. Please log in.'));
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Session expired. Please log in again.'));
        }
        return next(ApiError.unauthorized('Invalid token.'));
    }
};

/**
 * Checks req.user.role === 'admin'.
 * Must be used AFTER authenticate.
 */
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(ApiError.forbidden('Admin access required.'));
    }
    next();
};

/**
 * Optional auth — attaches req.user if token exists but doesn't block if missing.
 * Use for routes where auth enriches but is not required (e.g. GET /items).
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
    const token = authHeader.slice(7);
    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (_) {
        // Silently ignore invalid optional tokens
    }
    next();
};

module.exports = { authenticate, adminOnly, optionalAuth };
