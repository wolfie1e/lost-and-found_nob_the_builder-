/**
 * Component tests — EmptyState
 */
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../../../components/ui/EmptyState';

describe('EmptyState component', () => {
    test('renders title and description', () => {
        render(<EmptyState title="Nothing here" description="No items found." />);
        expect(screen.getByText('Nothing here')).toBeInTheDocument();
        expect(screen.getByText('No items found.')).toBeInTheDocument();
    });

    test('renders icon when provided', () => {
        render(<EmptyState icon="📭" title="Empty" />);
        expect(screen.getByText('📭')).toBeInTheDocument();
    });

    test('renders action element when provided', () => {
        render(
            <EmptyState title="No items" action={<button>Add Item</button>} />
        );
        expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
    });

    test('does NOT render action section when action is not provided', () => {
        render(<EmptyState title="No items" />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('renders without description without crashing', () => {
        expect(() => render(<EmptyState title="Empty" />)).not.toThrow();
    });
});
