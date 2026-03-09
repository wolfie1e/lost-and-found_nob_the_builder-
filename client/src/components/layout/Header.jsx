import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className={styles.header} role="banner">
            <div className="container">
                <nav className={styles.nav} aria-label="Main navigation">
                    <Link to="/" className={styles.brand} aria-label="Lost and Found home">
                        <span className={styles.brandIcon} aria-hidden="true">📦</span>
                        <span className={styles.brandText}>Lost <span className={styles.ampersand}>&</span> Found</span>
                    </Link>

                    <div className={styles.links}>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
                        >
                            Browse
                        </NavLink>
                        <NavLink
                            to="/assistant"
                            className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
                        >
                            Assistant
                        </NavLink>
                        {user && (
                            <NavLink
                                to="/my-items"
                                className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
                            >
                                My Items
                            </NavLink>
                        )}
                        {user?.role === 'admin' && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) => [styles.link, isActive ? styles.linkActive : ''].join(' ')}
                            >
                                Admin
                            </NavLink>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <ThemeToggle />
                        <div className={styles.desktopActions}>
                            {user ? (
                                <>
                                    <Link to="/report">
                                        <Button size="sm" variant="primary">+ Report Item</Button>
                                    </Link>
                                    <ProfileDropdown />
                                </>
                            ) : (
                                <>
                                    <Link to="/login"><Button size="sm" variant="ghost">Log in</Button></Link>
                                    <Link to="/register"><Button size="sm" variant="primary">Sign up</Button></Link>
                                </>
                            )}
                        </div>
                        <MobileMenu />
                    </div>
                </nav>
            </div>
        </header>
    );
}
