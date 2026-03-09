/**
 * Guardrail Service
 * Validates chatbot responses to ensure safety and grounding
 */

/**
 * Check if response appears to be grounded (not hallucinating)
 * @param {string} response - Model's response
 * @param {Array} items - The context items that were provided
 * @returns {boolean}
 */
function isResponseGrounded(response, items) {
    // If no items were provided, response should acknowledge lack of data
    if (!items || items.length === 0) {
        const acknowledgesNoData = /no (matching|relevant|found) items|could not find|don't have|not available/i.test(
            response
        );
        const inventsData = /found (a|an|the)|here (is|are)|item was found/i.test(response);

        // Should acknowledge no data and not invent data
        return acknowledgesNoData && !inventsData;
    }

    // If items exist, response should not claim absence
    const falseClaim = /no items|nothing found|couldn't find anything/i.test(response);
    if (falseClaim) {
        return false;
    }

    return true;
}

/**
 * Check for disallowed content in response
 * @param {string} response
 * @returns {boolean}
 */
function containsDisallowedContent(response) {
    const disallowedPatterns = [
        // Personal info leaks that shouldn't be there
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
        /\b\d{16}\b/, // Credit card pattern
        // Instructions leaking
        /you are a|your role is|system prompt|ignore previous/i,
        // Offensive content (basic check)
        /\b(fuck|shit|damn|bitch)\b/i,
    ];

    return disallowedPatterns.some((pattern) => pattern.test(response));
}

/**
 * Check if response is attempting to perform disallowed actions
 * @param {string} response
 * @returns {boolean}
 */
function attemptsDisallowedAction(response) {
    const disallowedActions = [
        /i (will|can) delete/i,
        /i (will|can) modify/i,
        /i (will|can) create/i,
        /i have (deleted|modified|created)/i,
        /sending email/i,
        /making phone call/i,
    ];

    return disallowedActions.some((pattern) => pattern.test(response));
}

/**
 * Main validation function
 * @param {string} response - Model's response
 * @param {Array} items - Context items
 * @returns {Object} - { valid: boolean, reason?: string }
 */
function validateResponse(response, items) {
    if (!response || typeof response !== 'string') {
        return { valid: false, reason: 'Invalid response format' };
    }

    if (response.length > 2000) {
        return { valid: false, reason: 'Response too long' };
    }

    if (!isResponseGrounded(response, items)) {
        return { valid: false, reason: 'Response not grounded in provided data' };
    }

    if (containsDisallowedContent(response)) {
        return { valid: false, reason: 'Response contains disallowed content' };
    }

    if (attemptsDisallowedAction(response)) {
        return { valid: false, reason: 'Response attempts disallowed action' };
    }

    return { valid: true };
}

/**
 * Get safe fallback response when validation fails
 * @param {string} reason - Validation failure reason
 * @returns {string}
 */
function getSafeFallback(reason) {
    console.warn('[Guardrail] Response blocked:', reason);
    return "I'm sorry, but I couldn't generate a safe response to your question. Please try rephrasing or ask about specific lost/found items.";
}

module.exports = {
    validateResponse,
    getSafeFallback,
    isResponseGrounded,
    containsDisallowedContent,
    attemptsDisallowedAction,
};
