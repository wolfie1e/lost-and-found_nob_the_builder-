/**
 * Component tests — Badge
 */
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../../components/ui/Badge';

describe('Badge component', () => {
    test('renders "Lost" text for type=lost', () => {
        render(<Badge type="lost" />);
        expect(screen.getByText(/lost/i)).toBeInTheDocument();
    });

    test('renders "Found" text for type=found', () => {
        render(<Badge type="found" />);
        expect(screen.getByText(/found/i)).toBeInTheDocument();
    });

    test('renders "Resolved" text for type=resolved', () => {
        render(<Badge type="resolved" />);
        expect(screen.getByText(/resolved/i)).toBeInTheDocument();
    });

    test('renders children as custom label when provided', () => {
        render(<Badge type="lost">Missing Item</Badge>);
        expect(screen.getByText('Missing Item')).toBeInTheDocument();
    });

    test('renders a span element', () => {
        const { container } = render(<Badge type="found" />);
        expect(container.firstChild?.tagName).toBe('SPAN');
    });
});
