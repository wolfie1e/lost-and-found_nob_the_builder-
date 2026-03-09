import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { timeAgo } from '../../utils/timeAgo';
import { CATEGORIES } from '../../constants/categories';
import styles from './ItemCard.module.css';

export default function ItemCard({ item, onResolve, onDelete }) {
    const { user } = useAuth();
    const canModify = user && (user.id === item.userId || user.role === 'admin');
    const cat = CATEGORIES.find((c) => c.value === item.category);

    return (
        <article
            className={[styles.card, item.resolved ? styles.resolved : ''].filter(Boolean).join(' ')}
            aria-label={`${item.type === 'lost' ? 'Lost' : 'Found'} item: ${item.title}`}
        >
            {/* Card Header */}
            <div className={styles.cardHeader}>
                <div className={styles.badges}>
                    <Badge type={item.type} />
                    {item.resolved && <Badge type="resolved">Resolved</Badge>}
                    {cat && (
                        <span className={styles.category} aria-label={`Category: ${cat.label}`}>
                            {cat.icon} {cat.label}
                        </span>
                    )}
                </div>
                <time className={styles.time} dateTime={item.date} title={new Date(item.date).toLocaleString()}>
                    {timeAgo(item.date)}
                </time>
            </div>

            {/* Title */}
            <Link to={`/items/${item.id}`} className={styles.title}>
                {item.title}
            </Link>

            {/* Description */}
            {item.description && (
                <p className={styles.description}>{item.description}</p>
            )}

            {/* Meta */}
            <div className={styles.meta}>
                <span className={styles.metaItem}>
                    <span aria-hidden="true">📍</span>
                    <span>{item.location}</span>
                </span>
                {user ? (
                    <span className={styles.metaItem}>
                        <span aria-hidden="true">✉️</span>
                        <span>{item.contact}</span>
                    </span>
                ) : (
                    <Link to="/login" className={styles.contactHide}>
                        🔒 Log in to see contact
                    </Link>
                )}
            </div>

            {/* Actions */}
            {!item.resolved && canModify && (
                <div className={styles.actions}>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            onResolve(item.id);
                            toast.success('Item marked as resolved!');
                        }}
                        aria-label={`Mark "${item.title}" as resolved`}
                    >
                        ✓ Mark Resolved
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                            if (window.confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                                onDelete(item.id);
                                toast.success('Item deleted.');
                            }
                        }}
                        aria-label={`Delete "${item.title}"`}
                    >
                        Delete
                    </Button>
                </div>
            )}
        </article>
    );
}
