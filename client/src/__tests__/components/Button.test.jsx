/**
 * Component tests — Button
 */
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/ui/Button';

describe('Button component', () => {
    test('renders children text', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    test('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Submit</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    test('does NOT call onClick when disabled', () => {
        const onClick = vi.fn();
        render(<Button onClick={onClick} disabled>Disabled</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });

    test('shows loading spinner text when loading=true', () => {
        render(<Button loading>Save</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('disabled');
    });

    test('renders as submit type when type="submit"', () => {
        render(<Button type="submit">Go</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    test('defaults to button type', () => {
        render(<Button>Btn</Button>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    test('applies custom className', () => {
        const { container } = render(<Button className="my-class">X</Button>);
        expect(container.firstChild).toHaveClass('my-class');
    });
});
