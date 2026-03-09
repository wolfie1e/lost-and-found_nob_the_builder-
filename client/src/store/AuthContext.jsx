import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Hydrate user from token on mount
    useEffect(() => {
        const token = localStorage.getItem('laf_token');
        if (!token) { setLoading(false); return; }
        getMe()
            .then((res) => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('laf_token');
                localStorage.removeItem('laf_user');
            })
            .finally(() => setLoading(false));
    }, []);

    // Listen for 401 auto-logout events from Axios interceptor
    useEffect(() => {
        const handle = () => { setUser(null); };
        window.addEventListener('auth:logout', handle);
        return () => window.removeEventListener('auth:logout', handle);
    }, []);

    const loginUser = useCallback((token, userData) => {
        localStorage.setItem('laf_token', token);
        localStorage.setItem('laf_user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('laf_token');
        localStorage.removeItem('laf_user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
