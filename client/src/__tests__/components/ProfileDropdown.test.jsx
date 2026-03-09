import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfileDropdown from '../../components/layout/ProfileDropdown';
import { AuthProvider } from '../../store/AuthContext';
import { vi } from 'vitest';

// Mock useAuth hook
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'student',
        },
        logout: mockLogout,
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('ProfileDropdown', () => {
    beforeEach(() => {
        mockLogout.mockClear();
        mockNavigate.mockClear();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <ProfileDropdown />
            </BrowserRouter>
        );
    };

    test('should render profile avatar button', () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /account menu/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('T'); // First letter of "Test User"
    });

    test('should open dropdown menu when avatar is clicked', () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /account menu/i });

        fireEvent.click(button);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /my items/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /logout/i })).toBeInTheDocument();
    });

    test('should close dropdown when clicking outside', async () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /account menu/i });

        fireEvent.click(button);
        expect(screen.getByText('Test User')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(document.body);

        await waitFor(() => {
            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        });
    });

    test('should close dropdown when pressing Escape', async () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /account menu/i });

        fireEvent.click(button);
        expect(screen.getByText('Test User')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        });
    });

    test('should call logout when Logout button is clicked', () => {
        renderComponent();
        const avatarButton = screen.getByRole('button', { name: /account menu/i });

        fireEvent.click(avatarButton);

        const logoutButton = screen.getByRole('menuitem', { name: /logout/i });
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should NOT logout when avatar is clicked (regression test)', () => {
        renderComponent();
        const button = screen.getByRole('button', { name: /account menu/i });

        fireEvent.click(button);

        // Logout should NOT be called just from opening the dropdown
        expect(mockLogout).not.toHaveBeenCalled();
    });
});
