/**
 * Retrieval Service
 * Searches the Lost & Found item repository to provide context for the chatbot
 */

/**
 * Search items based on query keywords and filters
 * @param {string} query - User's search query
 * @param {Array} items - Array of all items (from in-memory store or DB)
 * @returns {Array} - Relevant items
 */
function searchItems(query, items) {
    if (!query || !items || items.length === 0) {
        return [];
    }

    const queryLower = query.toLowerCase().trim();
    const keywords = queryLower.split(/\s+/);

    // Score each item based on keyword matches
    const scored = items.map((item) => {
        let score = 0;
        const searchableText = [
            item.title,
            item.description || '',
            item.location,
            item.category,
            item.type,
        ]
            .join(' ')
            .toLowerCase();

        // Check each keyword
        keywords.forEach((keyword) => {
            if (searchableText.includes(keyword)) {
                score += 1;
            }
            // Boost exact title matches
            if (item.title.toLowerCase().includes(keyword)) {
                score += 2;
            }
        });

        return { item, score };
    });

    // Filter to items with non-zero scores and sort by relevance
    const relevant = scored
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);

    // Return top 10 most relevant
    return relevant.slice(0, 10);
}

/**
 * Extract filters from query (e.g., "lost", "found", category names, locations)
 * @param {string} query
 * @returns {Object} - Extracted filters
 */
function extractFilters(query) {
    const queryLower = query.toLowerCase();
    const filters = {};

    // Detect type
    if (queryLower.includes('lost') && !queryLower.includes('found')) {
        filters.type = 'lost';
    } else if (queryLower.includes('found') && !queryLower.includes('lost')) {
        filters.type = 'found';
    }

    // Detect resolved status
    if (queryLower.includes('unclaimed') || queryLower.includes('not claimed')) {
        filters.resolved = false;
    }

    // Detect common categories
    const categories = ['keys', 'electronics', 'clothing', 'bag', 'id_card', 'wallet', 'book', 'sports'];
    categories.forEach((cat) => {
        const catVariations = [cat, cat.replace('_', ' '), cat.replace('_', '-')];
        if (catVariations.some((variation) => queryLower.includes(variation))) {
            filters.category = cat;
        }
    });

    return filters;
}

/**
 * Apply filters to items
 * @param {Array} items
 * @param {Object} filters
 * @returns {Array}
 */
function applyFilters(items, filters) {
    let filtered = [...items];

    if (filters.type) {
        filtered = filtered.filter((item) => item.type === filters.type);
    }

    if (filters.resolved !== undefined) {
        filtered = filtered.filter((item) => item.resolved === filters.resolved);
    }

    if (filters.category) {
        filtered = filtered.filter((item) => item.category === filters.category);
    }

    return filtered;
}

/**
 * Main retrieval function: search and filter items based on query
 * @param {string} query - User's natural language query
 * @param {Array} items - All available items
 * @returns {Array} - Relevant items for chatbot context
 */
function retrieveRelevantItems(query, items) {
    // Extract any filters from the query
    const filters = extractFilters(query);

    // Apply filters first
    let filtered = applyFilters(items, filters);

    // Then search within filtered results
    const relevant = searchItems(query, filtered);

    return relevant;
}

module.exports = {
    retrieveRelevantItems,
    searchItems,
    extractFilters,
    applyFilters,
};
