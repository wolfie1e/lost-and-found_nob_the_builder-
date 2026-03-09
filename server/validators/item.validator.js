const { body, validationResult } = require('express-validator');

const VALID_TYPES = ['lost', 'found'];

/**
 * Returns an Express middleware that sends 400 if there are validation errors
 */
const validate = (validations) => async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
        });
    }
    next();
};

/**
 * Validation rules for creating an item (POST /items)
 */
const createItemRules = [
    body('type')
        .trim()
        .notEmpty().withMessage('type is required')
        .isIn(VALID_TYPES).withMessage(`type must be one of: ${VALID_TYPES.join(', ')}`),

    body('title')
        .trim()
        .notEmpty().withMessage('title is required')
        .isLength({ min: 2, max: 100 }).withMessage('title must be 2–100 characters')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('description must be under 1000 characters')
        .escape(),

    body('location')
        .trim()
        .notEmpty().withMessage('location is required')
        .isLength({ min: 2, max: 200 }).withMessage('location must be 2–200 characters')
        .escape(),

    body('contact')
        .trim()
        .notEmpty().withMessage('contact is required')
        .isLength({ min: 5, max: 150 }).withMessage('contact must be 5–150 characters')
        .escape(),

    body('category')
        .optional()
        .trim()
        .isIn(['keys', 'electronics', 'clothing', 'bag', 'id_card', 'wallet', 'book', 'sports', 'other'])
        .withMessage('Invalid category'),
];

module.exports = { validate, createItemRules };
