import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEME_KEY = 'laf_theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
};

export function ThemeProvider({ children }) {
    // Initialize theme from localStorage or system preference
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved && (saved === THEMES.LIGHT || saved === THEMES.DARK)) {
            return saved;
        }

        // Fallback to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return THEMES.DARK;
        }

        return THEMES.LIGHT;
    });

    // Apply theme to document root
    useEffect(() => {
        const root = document.documentElement;

        // Remove both classes first
        root.classList.remove('light-theme', 'dark-theme');

        // Add the current theme class
        root.classList.add(`${theme}-theme`);

        // Persist to localStorage
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT));
    };

    const setLightTheme = () => setTheme(THEMES.LIGHT);
    const setDarkTheme = () => setTheme(THEMES.DARK);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                isDark: theme === THEMES.DARK,
                toggleTheme,
                setLightTheme,
                setDarkTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
