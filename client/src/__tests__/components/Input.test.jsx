/**
 * Component tests — Input
 */
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../../components/ui/Input';
import { forwardRef } from 'react';

describe('Input component', () => {
    test('renders with label when label prop is provided', () => {
        render(<Input id="name" label="Full Name" />);
        expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });

    test('renders error message when error prop provided', () => {
        render(<Input id="email" label="Email" error="Invalid email address" />);
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });

    test('renders hint text when hint prop provided', () => {
        render(<Input id="pass" label="Password" hint="Min 8 characters" />);
        expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
    });

    test('does NOT show hint when error overrides it', () => {
        render(<Input id="pass" label="Password" hint="Min 8 chars" error="Too short" />);
        expect(screen.getByText('Too short')).toBeInTheDocument();
        // Hint should not be shown when there's an error
        expect(screen.queryByText('Min 8 chars')).not.toBeInTheDocument();
    });

    test('renders as password type when type="password"', () => {
        render(<Input id="pwd" label="Password" type="password" />);
        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    test('renders placeholder text', () => {
        render(<Input id="search" label="Search" placeholder="Type to search..." />);
        expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument();
    });

    test('accepts user input', async () => {
        const user = userEvent.setup();
        render(<Input id="fname" label="First Name" />);
        const input = screen.getByLabelText('First Name');
        await user.type(input, 'Alice');
        expect(input).toHaveValue('Alice');
    });
});
