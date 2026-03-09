/**
 * Tests — timeAgo utility (frontend)
 */
import { describe, test, expect } from 'vitest';
import { timeAgo } from '../../../utils/timeAgo';

describe('timeAgo utility', () => {
    function msAgo(ms) {
        return new Date(Date.now() - ms).toISOString();
    }

    test('returns "just now" for brand new timestamps', () => {
        expect(timeAgo(new Date().toISOString())).toBe('just now');
    });

    test('returns "just now" for 45 seconds ago', () => {
        expect(timeAgo(msAgo(45 * 1000))).toBe('just now');
    });

    test('returns minutes for 10 minutes ago', () => {
        expect(timeAgo(msAgo(10 * 60 * 1000))).toBe('10m ago');
    });

    test('returns hours for 6 hours ago', () => {
        expect(timeAgo(msAgo(6 * 60 * 60 * 1000))).toBe('6h ago');
    });

    test('returns days for 3 days ago', () => {
        expect(timeAgo(msAgo(3 * 24 * 60 * 60 * 1000))).toBe('3d ago');
    });

    test('returns locale date string for more than 7 days ago', () => {
        const result = timeAgo(msAgo(10 * 24 * 60 * 60 * 1000));
        expect(result).not.toContain('ago');
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(3);
    });

    test('handles future timestamps gracefully (returns "just now")', () => {
        const future = new Date(Date.now() + 1000 * 60 * 60).toISOString();
        expect(timeAgo(future)).toBe('just now');
    });
});
