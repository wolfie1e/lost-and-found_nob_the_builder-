import { Toaster } from 'react-hot-toast';
import Header from './Header';
import styles from './Layout.module.css';

export default function Layout({ children }) {
    return (
        <div className={styles.root}>
            <Header />
            <main className={styles.main} id="main-content">
                {children}
            </main>
            <footer className={styles.footer}>
                <div className="container">
                    <p>© {new Date().getFullYear()} Campus Lost &amp; Found — Built with care for your community</p>
                </div>
            </footer>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3500,
                    style: {
                        fontFamily: 'var(--font-sans)',
                        fontSize: '13px',
                        borderRadius: '10px',
                        boxShadow: 'var(--shadow-md)',
                    },
                    success: { iconTheme: { primary: 'var(--color-found)', secondary: '#fff' } },
                    error: { iconTheme: { primary: 'var(--color-error)', secondary: '#fff' } },
                }}
            />
        </div>
    );
}
