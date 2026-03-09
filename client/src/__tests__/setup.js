/**
 * Vitest setup file — runs before each test file
 * Imports jest-dom matchers and mocks CSS modules
 */
import '@testing-library/jest-dom';

// Mock CSS modules globally so component imports don't fail
import { vi } from 'vitest';

// CSS Modules return an object where all keys return the class name
const handler = {
    get: (_, key) => (key === Symbol.toPrimitive ? () => '' : key),
};
vi.mock('*.module.css', () => ({ default: new Proxy({}, handler) }));
