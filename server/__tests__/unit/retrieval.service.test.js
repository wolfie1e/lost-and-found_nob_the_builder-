const {
    retrieveRelevantItems,
    searchItems,
    extractFilters,
    applyFilters,
} = require('../../services/retrieval.service');

describe('Retrieval Service', () => {
    const mockItems = [
        {
            id: '1',
            type: 'lost',
            title: 'Black Wallet',
            description: 'Found near Block C',
            location: 'Block C',
            category: 'wallet',
            date: '2024-01-01',
            resolved: false,
        },
        {
            id: '2',
            type: 'found',
            title: 'Silver Bottle',
            description: 'Metal water bottle',
            location: 'Library',
            category: 'other',
            date: '2024-01-02',
            resolved: false,
        },
        {
            id: '3',
            type: 'lost',
            title: 'ID Card',
            description: 'Student ID',
            location: 'Cafeteria',
            category: 'id_card',
            date: '2024-01-03',
            resolved: true,
        },
        {
            id: '4',
            type: 'found',
            title: 'Black Backpack',
            description: 'Contains electronics',
            location: 'Block C',
            category: 'bag',
            date: '2024-01-04',
            resolved: false,
        },
    ];

    describe('searchItems', () => {
        test('should find items matching keywords', () => {
            const results = searchItems('black', mockItems);
            expect(results.length).toBe(2);
            expect(results.map((i) => i.id)).toContain('1');
            expect(results.map((i) => i.id)).toContain('4');
        });

        test('should boost title matches', () => {
            const results = searchItems('wallet', mockItems);
            expect(results[0].id).toBe('1'); // "Black Wallet" should be first
        });

        test('should handle multi-word queries', () => {
            const results = searchItems('block c', mockItems);
            expect(results.length).toBeGreaterThan(0);
        });

        test('should return empty array for no matches', () => {
            const results = searchItems('nonexistent', mockItems);
            expect(results).toEqual([]);
        });

        test('should return max 10 items', () => {
            const manyItems = Array(20)
                .fill(null)
                .map((_, i) => ({
                    ...mockItems[0],
                    id: `item-${i}`,
                    title: 'Test Item',
                }));
            const results = searchItems('test', manyItems);
            expect(results.length).toBe(10);
        });
    });

    describe('extractFilters', () => {
        test('should detect "lost" type', () => {
            const filters = extractFilters('show me lost items');
            expect(filters.type).toBe('lost');
        });

        test('should detect "found" type', () => {
            const filters = extractFilters('has anyone found a wallet');
            expect(filters.type).toBe('found');
        });

        test('should detect unclaimed status', () => {
            const filters = extractFilters('show unclaimed items');
            expect(filters.resolved).toBe(false);
        });

        test('should detect category', () => {
            const filters = extractFilters('list all electronics');
            expect(filters.category).toBe('electronics');
        });

        test('should return empty object for generic query', () => {
            const filters = extractFilters('help me');
            expect(Object.keys(filters).length).toBe(0);
        });
    });

    describe('applyFilters', () => {
        test('should filter by type', () => {
            const filtered = applyFilters(mockItems, { type: 'lost' });
            expect(filtered.every((i) => i.type === 'lost')).toBe(true);
        });

        test('should filter by resolved status', () => {
            const filtered = applyFilters(mockItems, { resolved: false });
            expect(filtered.every((i) => !i.resolved)).toBe(true);
        });

        test('should filter by category', () => {
            const filtered = applyFilters(mockItems, { category: 'wallet' });
            expect(filtered.every((i) => i.category === 'wallet')).toBe(true);
        });

        test('should apply multiple filters', () => {
            const filtered = applyFilters(mockItems, { type: 'found', resolved: false });
            expect(filtered.length).toBe(2);
        });
    });

    describe('retrieveRelevantItems', () => {
        test('should retrieve and rank relevant items', () => {
            const results = retrieveRelevantItems('black wallet', mockItems);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].title).toContain('Wallet');
        });

        test('should apply filters before searching', () => {
            const results = retrieveRelevantItems('show me lost items in block c', mockItems);
            expect(results.every((i) => i.type === 'lost')).toBe(true);
        });

        test('should handle empty items array', () => {
            const results = retrieveRelevantItems('test', []);
            expect(results).toEqual([]);
        });
    });
});
