import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import styles from './MobileMenu.module.css';

export default function MobileMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [window.location.pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div className={styles.mobileMenu}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={styles.hamburger}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
                <span className={[styles.line, isOpen ? styles.lineOpen : ''].join(' ')} />
                <span className={[styles.line, isOpen ? styles.lineOpen : ''].join(' ')} />
                <span className={[styles.line, isOpen ? styles.lineOpen : ''].join(' ')} />
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <nav className={styles.menu} role="navigation">
                        <div className={styles.menuHeader}>
                            {user && (
                                <div className={styles.userSection}>
                                    <div className={styles.userAvatar}>
                                        {user.name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <div className={styles.userInfo}>
                                        <div className={styles.userName}>{user.name}</div>
                                        <div className={styles.userEmail}>{user.email}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.links}>
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    [styles.link, isActive ? styles.linkActive : ''].join(' ')
                                }
                            >
                                <span className={styles.linkIcon}>🏠</span>
                                <span>Browse Items</span>
                            </NavLink>

                            <NavLink
                                to="/assistant"
                                className={({ isActive }) =>
                                    [styles.link, isActive ? styles.linkActive : ''].join(' ')
                                }
                            >
                                <span className={styles.linkIcon}>🤖</span>
                                <span>Assistant</span>
                            </NavLink>

                            {user && (
                                <NavLink
                                    to="/my-items"
                                    className={({ isActive }) =>
                                        [styles.link, isActive ? styles.linkActive : ''].join(' ')
                                    }
                                >
                                    <span className={styles.linkIcon}>📦</span>
                                    <span>My Items</span>
                                </NavLink>
                            )}

                            {user?.role === 'admin' && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        [styles.link, isActive ? styles.linkActive : ''].join(' ')
                                    }
                                >
                                    <span className={styles.linkIcon}>⚙️</span>
                                    <span>Admin Dashboard</span>
                                </NavLink>
                            )}
                        </div>

                        <div className={styles.actions}>
                            {user ? (
                                <>
                                    <Link to="/report" onClick={() => setIsOpen(false)}>
                                        <Button variant="primary" style={{ width: '100%' }}>
                                            + Report Item
                                        </Button>
                                    </Link>
                                    <button onClick={handleLogout} className={styles.logoutBtn}>
                                        <span className={styles.linkIcon}>🚪</span>
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsOpen(false)}>
                                        <Button variant="ghost" style={{ width: '100%' }}>
                                            Log in
                                        </Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)}>
                                        <Button variant="primary" style={{ width: '100%' }}>
                                            Sign up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </>
            )}
        </div>
    );
}
