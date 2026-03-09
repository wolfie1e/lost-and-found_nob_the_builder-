import styles from './Button.module.css';

/**
 * @param {'primary'|'secondary'|'danger'|'ghost'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 */
export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    type = 'button',
    disabled,
    className = '',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={[
                styles.btn,
                styles[variant],
                styles[size],
                fullWidth ? styles.fullWidth : '',
                loading ? styles.loading : '',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
            {...props}
        >
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            {children}
        </button>
    );
}
