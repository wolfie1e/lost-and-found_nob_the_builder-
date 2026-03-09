/**
 * Tests — categories constants
 */
import { describe, test, expect } from 'vitest';
import { CATEGORIES } from '../../../constants/categories';

describe('CATEGORIES constant', () => {
    test('contains exactly 9 categories', () => {
        expect(CATEGORIES).toHaveLength(9);
    });

    test('every category has a value, label, and icon', () => {
        CATEGORIES.forEach((cat) => {
            expect(cat.value).toBeDefined();
            expect(cat.label).toBeDefined();
            expect(cat.icon).toBeDefined();
            expect(typeof cat.value).toBe('string');
            expect(typeof cat.label).toBe('string');
        });
    });

    test('category values are all unique', () => {
        const values = CATEGORIES.map((c) => c.value);
        expect(new Set(values).size).toBe(CATEGORIES.length);
    });

    test('contains "other" category as a fallback', () => {
        const other = CATEGORIES.find((c) => c.value === 'other');
        expect(other).toBeDefined();
    });

    test('contains expected category types', () => {
        const values = CATEGORIES.map((c) => c.value);
        ['keys', 'electronics', 'clothing', 'bag', 'id_card', 'wallet', 'book', 'sports', 'other'].forEach((expected) => {
            expect(values).toContain(expected);
        });
    });
});
