const { NODE_ENV } = require('../config/env');

/**
 * Custom API error class with HTTP status code
 */
class ApiError extends Error {
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    static badRequest(msg, errors) { return new ApiError(400, msg, errors); }
    static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
    static forbidden(msg = 'Forbidden') { return new ApiError(403, msg); }
    static notFound(msg = 'Resource not found') { return new ApiError(404, msg); }
    static tooMany(msg = 'Too many requests') { return new ApiError(429, msg); }
    static internal(msg = 'Internal server error') { return new ApiError(500, msg); }
}

/**
 * Async wrapper — catches async errors and forwards to Express error handler
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Express error handler — must be last middleware
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // Handle express-validator errors
    if (err.array) {
        statusCode = 400;
        message = 'Validation failed';
        errors = err.array().map((e) => ({ field: e.path, message: e.msg }));
    }

    // In production, hide internal error details
    if (statusCode === 500 && NODE_ENV === 'production') {
        message = 'An unexpected error occurred. Please try again.';
        errors = [];
    }

    // Log all server errors
    if (statusCode >= 500) {
        console.error(`[ERROR] ${err.stack || err.message}`);
    }

    res.status(statusCode).json({
        status: 'error',
        message,
        ...(errors.length ? { errors } : {}),
        ...(NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
    });
};

module.exports = { ApiError, catchAsync, errorHandler };
