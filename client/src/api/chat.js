import apiClient from './client';

/**
 * Ask the Lost & Found assistant a question
 * @param {string} query - The user's question
 */
export const askAssistant = (query) =>
    apiClient.post('/chat/ask', { query }).then((r) => r.data);
