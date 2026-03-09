/**
 * Ollama Service
 * Handles communication with Ollama API for chat completions
 */

const {
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT,
} = require('../config/env');

/**
 * Call Ollama API to generate a chat response
 * @param {string} systemPrompt - System instructions
 * @param {string} userQuery - User's question
 * @returns {Promise<string>} - Generated response
 */
async function generateChatResponse(systemPrompt, userQuery) {
    const url = `${OLLAMA_BASE_URL}/api/chat`;

    const payload = {
        model: OLLAMA_MODEL,
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: userQuery,
            },
        ],
        stream: false,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(OLLAMA_TIMEOUT),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        if (!data.message || !data.message.content) {
            throw new Error('Invalid response format from Ollama');
        }

        return data.message.content.trim();
    } catch (error) {
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            throw new Error('Ollama request timed out. Please try again.');
        }
        throw error;
    }
}

/**
 * Check if Ollama is available and responsive
 * @returns {Promise<boolean>}
 */
async function checkOllamaHealth() {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000),
        });
        return response.ok;
    } catch {
        return false;
    }
}

module.exports = {
    generateChatResponse,
    checkOllamaHealth,
};
