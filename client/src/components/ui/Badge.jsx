import styles from './Badge.module.css';

const VARIANTS = {
    lost: { label: 'Lost', className: styles.lost },
    found: { label: 'Found', className: styles.found },
    resolved: { label: 'Resolved', className: styles.resolved },
    default: { label: '', className: styles.default },
};

export default function Badge({ type, children, className = '' }) {
    const variant = VARIANTS[type] || VARIANTS.default;
    return (
        <span className={[styles.badge, variant.className, className].filter(Boolean).join(' ')}>
            {children || variant.label}
        </span>
    );
}
