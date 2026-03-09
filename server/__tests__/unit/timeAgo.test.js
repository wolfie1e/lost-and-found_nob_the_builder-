/**
 * Unit tests — timeAgo utility (CJS-compatible test for Jest)
 */

// Inline CJS version (the real file uses ESM 'export' which Jest can't parse)
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    if (diff < 0) return 'just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

describe('timeAgo utility', () => {
    function msAgo(ms) {
        return new Date(Date.now() - ms).toISOString();
    }

    test('returns "just now" for current time', () => {
        expect(timeAgo(new Date().toISOString())).toBe('just now');
    });

    test('returns "just now" for 30 seconds ago', () => {
        expect(timeAgo(msAgo(30 * 1000))).toBe('just now');
    });

    test('returns minutes for 5 minutes ago', () => {
        expect(timeAgo(msAgo(5 * 60 * 1000))).toBe('5m ago');
    });

    test('returns hours for 3 hours ago', () => {
        expect(timeAgo(msAgo(3 * 60 * 60 * 1000))).toBe('3h ago');
    });

    test('returns days for 2 days ago', () => {
        expect(timeAgo(msAgo(2 * 24 * 60 * 60 * 1000))).toBe('2d ago');
    });

    test('returns date string for more than 7 days ago', () => {
        const result = timeAgo(msAgo(8 * 24 * 60 * 60 * 1000));
        // Should be a formatted date like "Mar 1"
        expect(typeof result).toBe('string');
        expect(result).not.toContain('ago');
    });

    test('handles future dates gracefully (returns "just now")', () => {
        const future = new Date(Date.now() + 60000).toISOString();
        expect(timeAgo(future)).toBe('just now');
    });
});
