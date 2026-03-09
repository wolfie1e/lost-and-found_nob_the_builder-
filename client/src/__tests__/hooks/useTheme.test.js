import { renderHook, act } from '@testing-library/react';
import { ThemeProvider } from '../../store/ThemeContext';
import { useTheme } from '../../hooks/useTheme';

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        // Reset document classes
        document.documentElement.className = '';
    });

    test('should initialize with light theme by default', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
        });

        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
    });

    test('should toggle between light and dark themes', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
        });

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
    });

    test('should persist theme to localStorage', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
        });

        act(() => {
            result.current.setDarkTheme();
        });

        expect(localStorage.getItem('laf_theme')).toBe('dark');

        act(() => {
            result.current.setLightTheme();
        });

        expect(localStorage.getItem('laf_theme')).toBe('light');
    });

    test('should load saved theme from localStorage', () => {
        localStorage.setItem('laf_theme', 'dark');

        const { result } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
        });

        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);
    });

    test('should apply theme class to document', () => {
        const { result } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
        });

        expect(document.documentElement.classList.contains('light-theme')).toBe(true);

        act(() => {
            result.current.setDarkTheme();
        });

        expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
        expect(document.documentElement.classList.contains('light-theme')).toBe(false);
    });
});
