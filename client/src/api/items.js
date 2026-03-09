import apiClient from './client';

/**
 * Fetch a paginated/filtered list of items
 * @param {Object} params - { type, resolved, category, q, page, limit }
 */
export const getItems = (params = {}) =>
    apiClient.get('/items', { params }).then((r) => r.data);

/**
 * Fetch a single item by ID
 */
export const getItem = (id) =>
    apiClient.get(`/items/${id}`).then((r) => r.data);

/**
 * Create a new item
 * @param {Object} payload - { type, title, description, location, contact, category }
 */
export const createItem = (payload) =>
    apiClient.post('/items', payload).then((r) => r.data);

/**
 * Mark an item as resolved
 */
export const resolveItem = (id) =>
    apiClient.patch(`/items/${id}/resolve`).then((r) => r.data);

/**
 * Delete an item
 */
export const deleteItem = (id) =>
    apiClient.delete(`/items/${id}`).then((r) => r.data);
