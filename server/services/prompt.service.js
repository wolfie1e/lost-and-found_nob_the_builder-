/**
 * Prompt Service
 * Builds safe, grounded prompts for the Lost & Found chatbot
 */

/**
 * Format items as context for the chatbot
 * @param {Array} items - Retrieved relevant items
 * @returns {string} - Formatted context string
 */
function formatItemsAsContext(items) {
    if (!items || items.length === 0) {
        return 'No matching items found in the database.';
    }

    const formatted = items.map((item, idx) => {
        return `
[Item ${idx + 1}]
Type: ${item.type}
Title: ${item.title}
Description: ${item.description || 'N/A'}
Location: ${item.location}
Category: ${item.category}
Date: ${new Date(item.date).toLocaleDateString()}
Status: ${item.resolved ? 'Resolved' : 'Unclaimed'}
Contact: ${item.contact}
        `.trim();
    });

    return formatted.join('\n\n');
}

/**
 * Build the system prompt with strict guardrails
 * @param {Array} items - Retrieved items to use as context
 * @returns {string} - Complete system prompt
 */
function buildSystemPrompt(items) {
    const context = formatItemsAsContext(items);

    return `You are a helpful Lost & Found assistant for a campus/college.

Your role is to help users find information about lost and found items based ONLY on the data provided below.

STRICT RULES:
1. Answer ONLY based on the items listed below. Do NOT make up or invent information.
2. If the data does not support the user's question, clearly state: "I could not find any matching items in the current database."
3. Do NOT reveal full contact information (email/phone) unless explicitly present and relevant.
4. Do NOT provide advice beyond searching the database (e.g., no legal advice, no personal recommendations).
5. If asked to do something outside searching lost/found items, politely decline and redirect to your purpose.
6. Be concise, friendly, and helpful.
7. If multiple items match, summarize them briefly or list them.
8. NEVER claim to have information you don't have.

CURRENT LOST & FOUND ITEMS:
${context}

Now answer the user's question based ONLY on the information above.`;
}

/**
 * Validate and sanitize user query for prompt injection
 * @param {string} query - User's input
 * @returns {string} - Sanitized query
 */
function sanitizeQuery(query) {
    if (!query || typeof query !== 'string') {
        throw new Error('Invalid query');
    }

    // Remove excessive length
    const maxLength = 500;
    let sanitized = query.trim().slice(0, maxLength);

    // Detect and neutralize potential prompt injection patterns
    const injectionPatterns = [
        /ignore (previous|all|above) (instructions|prompts|rules)/i,
        /disregard (previous|all|above) (instructions|prompts|rules)/i,
        /system:\s*/i,
        /assistant:\s*/i,
        /you are now/i,
        /new (instructions|role|persona)/i,
    ];

    const hasInjectionAttempt = injectionPatterns.some((pattern) => pattern.test(sanitized));

    if (hasInjectionAttempt) {
        console.warn('[Security] Potential prompt injection detected in query:', sanitized);
        // Neutralize by adding clear user marker
        sanitized = `User is asking: "${sanitized}"`;
    }

    return sanitized;
}

module.exports = {
    buildSystemPrompt,
    formatItemsAsContext,
    sanitizeQuery,
};
