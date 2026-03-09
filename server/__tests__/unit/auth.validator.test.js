/**
 * Unit tests — Auth Validator
 * Tests validation rules for register and login endpoints
 */
const { validationResult } = require('express-validator');
const { registerRules, loginRules } = require('../../validators/auth.validator');

async function runRules(rules, body) {
    const req = { body, headers: {}, params: {}, query: {} };
    await Promise.all(rules.map((r) => r.run(req)));
    return validationResult(req);
}

describe('Auth Validator — registerRules', () => {
    const valid = {
        name: 'Alex Student',
        email: 'alex@campus.edu',
        password: 'Password1',
    };

    test('accepts a fully valid registration payload', async () => {
        const result = await runRules(registerRules, valid);
        expect(result.isEmpty()).toBe(true);
    });

    describe('name field', () => {
        test('rejects missing name', async () => {
            const result = await runRules(registerRules, { ...valid, name: undefined });
            expect(result.array().map((e) => e.path)).toContain('name');
        });

        test('rejects name shorter than 2 characters', async () => {
            const result = await runRules(registerRules, { ...valid, name: 'A' });
            expect(result.array().map((e) => e.path)).toContain('name');
        });

        test('rejects name longer than 80 characters', async () => {
            const result = await runRules(registerRules, { ...valid, name: 'A'.repeat(81) });
            expect(result.array().map((e) => e.path)).toContain('name');
        });
    });

    describe('email field', () => {
        test('rejects missing email', async () => {
            const result = await runRules(registerRules, { ...valid, email: undefined });
            expect(result.array().map((e) => e.path)).toContain('email');
        });

        test('rejects invalid email format', async () => {
            const result = await runRules(registerRules, { ...valid, email: 'not-an-email' });
            expect(result.array().map((e) => e.path)).toContain('email');
        });

        test('accepts valid email', async () => {
            const result = await runRules(registerRules, valid);
            const err = result.array().find((e) => e.path === 'email');
            expect(err).toBeUndefined();
        });
    });

    describe('password field', () => {
        test('rejects missing password', async () => {
            const result = await runRules(registerRules, { ...valid, password: undefined });
            expect(result.array().map((e) => e.path)).toContain('password');
        });

        test('rejects password shorter than 8 characters', async () => {
            const result = await runRules(registerRules, { ...valid, password: 'Pass1' });
            expect(result.array().map((e) => e.path)).toContain('password');
        });

        test('rejects password without uppercase letter', async () => {
            const result = await runRules(registerRules, { ...valid, password: 'password1' });
            expect(result.array().map((e) => e.path)).toContain('password');
        });

        test('rejects password without a number', async () => {
            const result = await runRules(registerRules, { ...valid, password: 'PasswordOnly' });
            expect(result.array().map((e) => e.path)).toContain('password');
        });

        test('accepts strong password with uppercase + number', async () => {
            const result = await runRules(registerRules, { ...valid, password: 'StrongPass1' });
            const err = result.array().find((e) => e.path === 'password');
            expect(err).toBeUndefined();
        });
    });
});

describe('Auth Validator — loginRules', () => {
    const valid = { email: 'alex@campus.edu', password: 'Password1' };

    test('accepts valid login payload', async () => {
        const result = await runRules(loginRules, valid);
        expect(result.isEmpty()).toBe(true);
    });

    test('rejects missing email', async () => {
        const result = await runRules(loginRules, { password: 'Password1' });
        expect(result.array().map((e) => e.path)).toContain('email');
    });

    test('rejects invalid email format', async () => {
        const result = await runRules(loginRules, { email: 'bad', password: 'Password1' });
        expect(result.array().map((e) => e.path)).toContain('email');
    });

    test('rejects missing password', async () => {
        const result = await runRules(loginRules, { email: 'alex@campus.edu' });
        expect(result.array().map((e) => e.path)).toContain('password');
    });
});
