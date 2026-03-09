const express = require('express');
const { body, validationResult } = require('express-validator');
const { apiLimiter } = require('../middleware/rateLimiter');
const { catchAsync, ApiError } = require('../middleware/errorHandler');
const { retrieveRelevantItems } = require('../services/retrieval.service');
const { buildSystemPrompt, sanitizeQuery } = require('../services/prompt.service');
const { generateChatResponse } = require('../services/ollama.service');
const { validateResponse, getSafeFallback } = require('../services/guardrail.service');

const router = express.Router();

// Validation rules for chat request
const chatRules = [
    body('query')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Query must be between 1 and 500 characters'),
];

/**
 * POST /api/chat/ask
 * Ask the Lost & Found assistant a question
 */
router.post(
    '/ask',
    apiLimiter,
    chatRules,
    catchAsync(async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw ApiError.badRequest('Invalid query', errors.array());
        }

        const { query } = req.body;

        // Step 1: Sanitize query for prompt injection
        const sanitizedQuery = sanitizeQuery(query);

        // Step 2: Retrieve relevant items from the database
        // NOTE: Currently using in-memory items array from app.js
        // In production, this should query the actual database
        const items = req.app.get('items') || [];
        const relevantItems = retrieveRelevantItems(sanitizedQuery, items);

        console.log(`[Chat] Query: "${sanitizedQuery}" | Found ${relevantItems.length} relevant items`);

        // Step 3: Build grounded system prompt
        const systemPrompt = buildSystemPrompt(relevantItems);

        // Step 4: Generate response from Ollama
        let response;
        try {
            response = await generateChatResponse(systemPrompt, sanitizedQuery);
        } catch (error) {
            console.error('[Chat] Ollama error:', error.message);
            throw ApiError.serviceUnavailable(
                'The assistant is currently unavailable. Please ensure Ollama is running and try again.'
            );
        }

        // Step 5: Validate response with guardrails
        const validation = validateResponse(response, relevantItems);
        if (!validation.valid) {
            response = getSafeFallback(validation.reason);
        }

        // Step 6: Return safe, validated response
        res.json({
            status: 'ok',
            data: {
                answer: response,
                itemsFound: relevantItems.length,
            },
        });
    })
);

/**
 * GET /api/chat/health
 * Check if Ollama service is available
 */
router.get(
    '/health',
    catchAsync(async (req, res) => {
        const { checkOllamaHealth } = require('../services/ollama.service');
        const isHealthy = await checkOllamaHealth();

        res.json({
            status: 'ok',
            data: {
                ollama: isHealthy ? 'available' : 'unavailable',
            },
        });
    })
);

module.exports = { router };
