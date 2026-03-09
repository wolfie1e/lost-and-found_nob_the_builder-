const {
    validateResponse,
    getSafeFallback,
    isResponseGrounded,
    containsDisallowedContent,
    attemptsDisallowedAction,
} = require('../../services/guardrail.service');

describe('Guardrail Service', () => {
    const mockItems = [
        {
            title: 'Black Wallet',
            description: 'Lost wallet',
            type: 'lost',
        },
    ];

    describe('isResponseGrounded', () => {
        test('should accept grounded response when items exist', () => {
            const response = 'I found a Black Wallet in the database.';
            expect(isResponseGrounded(response, mockItems)).toBe(true);
        });

        test('should reject false claims when items exist', () => {
            const response = 'No items found in the database.';
            expect(isResponseGrounded(response, mockItems)).toBe(false);
        });

        test('should accept acknowledgment when no items', () => {
            const response = 'I could not find any matching items in the database.';
            expect(isResponseGrounded(response, [])).toBe(true);
        });

        test('should reject invented data when no items', () => {
            const response = 'Here is a wallet I found for you.';
            expect(isResponseGrounded(response, [])).toBe(false);
        });
    });

    describe('containsDisallowedContent', () => {
        test('should detect SSN pattern', () => {
            const response = 'Contact number is 123-45-6789';
            expect(containsDisallowedContent(response)).toBe(true);
        });

        test('should detect credit card pattern', () => {
            const response = 'Card number: 1234567890123456';
            expect(containsDisallowedContent(response)).toBe(true);
        });

        test('should detect prompt leakage', () => {
            const response = 'You are a helpful assistant. Your role is...';
            expect(containsDisallowedContent(response)).toBe(true);
        });

        test('should detect offensive language', () => {
            const response = 'This is fucking annoying';
            expect(containsDisallowedContent(response)).toBe(true);
        });

        test('should accept clean content', () => {
            const response = 'I found a black wallet at Block C.';
            expect(containsDisallowedContent(response)).toBe(false);
        });
    });

    describe('attemptsDisallowedAction', () => {
        test('should detect deletion attempts', () => {
            const response = 'I will delete that item for you.';
            expect(attemptsDisallowedAction(response)).toBe(true);
        });

        test('should detect modification attempts', () => {
            const response = 'I can modify the database entry.';
            expect(attemptsDisallowedAction(response)).toBe(true);
        });

        test('should detect email sending claims', () => {
            const response = 'Sending email to the user now.';
            expect(attemptsDisallowedAction(response)).toBe(true);
        });

        test('should accept passive informational responses', () => {
            const response = 'Here are the matching items from the database.';
            expect(attemptsDisallowedAction(response)).toBe(false);
        });
    });

    describe('validateResponse', () => {
        test('should accept valid grounded response', () => {
            const response = 'I found a Black Wallet in the lost items.';
            const result = validateResponse(response, mockItems);
            expect(result.valid).toBe(true);
        });

        test('should reject invalid format', () => {
            const result = validateResponse(null, mockItems);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('Invalid response format');
        });

        test('should reject overly long responses', () => {
            const longResponse = 'x'.repeat(3000);
            const result = validateResponse(longResponse, mockItems);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('too long');
        });

        test('should reject ungrounded responses', () => {
            const response = 'No items exist.';
            const result = validateResponse(response, mockItems);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('not grounded');
        });

        test('should reject disallowed content', () => {
            const response = 'Your SSN is 123-45-6789';
            const result = validateResponse(response, mockItems);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('disallowed content');
        });

        test('should reject disallowed actions', () => {
            const response = 'I will delete this item.';
            const result = validateResponse(response, mockItems);
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('disallowed action');
        });
    });

    describe('getSafeFallback', () => {
        test('should return safe fallback message', () => {
            const fallback = getSafeFallback('test reason');
            expect(fallback).toContain('sorry');
            expect(fallback).toContain('safe response');
        });
    });
});
