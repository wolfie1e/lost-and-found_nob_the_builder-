import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './ProfileDropdown.module.css';

export default function ProfileDropdown() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside);
            };
        }
    }, [isOpen]);

    // Close dropdown on route change
    useEffect(() => {
        setIsOpen(false);
    }, [window.location.pathname]);

    // Close on Escape key
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    if (!user) return null;

    const initial = user.name?.[0]?.toUpperCase() || '?';

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.trigger}
                aria-label={`Account menu for ${user.name}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <span className={styles.avatar}>
                    {initial}
                </span>
            </button>

            {isOpen && (
                <div className={styles.menu} role="menu">
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                    </div>

                    <div className={styles.divider} />

                    <Link
                        to="/my-items"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className={styles.menuIcon}>👤</span>
                        <span>My Items</span>
                    </Link>

                    {user.role === 'admin' && (
                        <Link
                            to="/admin"
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className={styles.menuIcon}>⚙️</span>
                            <span>Admin Dashboard</span>
                        </Link>
                    )}

                    <div className={styles.divider} />

                    <button
                        onClick={handleLogout}
                        className={[styles.menuItem, styles.logoutBtn].join(' ')}
                        role="menuitem"
                    >
                        <span className={styles.menuIcon}>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}
