/**
 * Unit tests — Error Handler & ApiError
 */
const { ApiError, catchAsync, errorHandler } = require('../../middleware/errorHandler');

describe('ApiError', () => {
    test('creates a 400 bad request error', () => {
        const err = ApiError.badRequest('Bad input');
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Bad input');
        expect(err.isOperational).toBe(true);
    });

    test('creates a 401 unauthorized error', () => {
        const err = ApiError.unauthorized();
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Unauthorized');
    });

    test('creates a 403 forbidden error', () => {
        const err = ApiError.forbidden('No admin access');
        expect(err.statusCode).toBe(403);
        expect(err.message).toBe('No admin access');
    });

    test('creates a 404 not found error', () => {
        const err = ApiError.notFound();
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Resource not found');
    });

    test('creates a 429 too many error', () => {
        const err = ApiError.tooMany();
        expect(err.statusCode).toBe(429);
    });

    test('creates a 500 internal error', () => {
        const err = ApiError.internal();
        expect(err.statusCode).toBe(500);
    });

    test('stores errors array', () => {
        const errors = [{ field: 'title', message: 'required' }];
        const err = ApiError.badRequest('Validation failed', errors);
        expect(err.errors).toEqual(errors);
    });
});

describe('catchAsync', () => {
    test('passes async errors to next()', async () => {
        const routeError = new Error('Something went wrong');
        const fn = catchAsync(async () => { throw routeError; });

        const next = jest.fn();
        await fn({}, {}, next);
        expect(next).toHaveBeenCalledWith(routeError);
    });

    test('does NOT call next() when fn resolves normally', async () => {
        const fn = catchAsync(async (req, res) => { res.data = 'ok'; });
        const next = jest.fn();
        const res = {};
        await fn({}, res, next);
        expect(next).not.toHaveBeenCalled();
        expect(res.data).toBe('ok');
    });
});

describe('errorHandler middleware', () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        process.env.NODE_ENV = 'test';
    });

    test('returns correct status and message for ApiError', () => {
        const err = ApiError.notFound('Item not found');
        errorHandler(err, req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            status: 'error',
            message: 'Item not found',
        }));
    });

    test('defaults to 500 for unknown errors', () => {
        const err = new Error('Unexpected');
        errorHandler(err, req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('returns 400 with errors array for validation errors', () => {
        const err = ApiError.badRequest('Validation failed', [{ field: 'title', message: 'required' }]);
        errorHandler(err, req, res, () => { });
        expect(res.status).toHaveBeenCalledWith(400);
        const body = res.json.mock.calls[0][0];
        expect(body.errors).toHaveLength(1);
    });
});
