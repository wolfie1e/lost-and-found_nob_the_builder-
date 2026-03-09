import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getItem, resolveItem, deleteItem } from '../api/items';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { timeAgo } from '../utils/timeAgo';
import { CATEGORIES } from '../constants/categories';
import styles from './ItemDetailPage.module.css';

export default function ItemDetailPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        getItem(id)
            .then((res) => setItem(res.data))
            .catch((err) => setError(err.message || 'Item not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const canModify = user && item && (user.id === item.userId || user.role === 'admin');
    const cat = item ? CATEGORIES.find((c) => c.value === item.category) : null;

    if (loading) return (
        <div className="container page-enter">
            <div className={styles.loadingWrap}>
                <div className={styles.skeleton} style={{ height: 28, width: 80 }} />
                <div className={styles.skeleton} style={{ height: 40, width: '60%', marginTop: 16 }} />
                <div className={styles.skeleton} style={{ height: 20, width: '90%', marginTop: 12 }} />
                <div className={styles.skeleton} style={{ height: 20, width: '70%', marginTop: 8 }} />
            </div>
        </div>
    );

    if (error) return (
        <div className="container page-enter">
            <EmptyState icon="🔍" title="Item not found" description={error} action={<Link to="/"><Button>Back to Home</Button></Link>} />
        </div>
    );

    return (
        <div className="container page-enter">
            <div className={styles.wrapper}>
                <Link to="/" className={styles.back}>← Back to all items</Link>

                <div className={styles.card}>
                    {/* Header */}
                    <div className={styles.cardTop}>
                        <div className={styles.badges}>
                            <Badge type={item.type} />
                            {item.resolved && <Badge type="resolved">Resolved</Badge>}
                            {cat && <span className={styles.category}>{cat.icon} {cat.label}</span>}
                        </div>
                        <time className={styles.time} dateTime={item.date}>
                            Reported {timeAgo(item.date)} — {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </time>
                    </div>

                    <h1 className={styles.title}>{item.title}</h1>

                    {item.description && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Description</h2>
                            <p className={styles.description}>{item.description}</p>
                        </div>
                    )}

                    <div className={styles.details}>
                        <div className={styles.detail}>
                            <span className={styles.detailIcon} aria-hidden="true">📍</span>
                            <div>
                                <span className={styles.detailLabel}>Location</span>
                                <span className={styles.detailValue}>{item.location}</span>
                            </div>
                        </div>
                        <div className={styles.detail}>
                            <span className={styles.detailIcon} aria-hidden="true">✉️</span>
                            <div>
                                <span className={styles.detailLabel}>Contact</span>
                                {user ? (
                                    <span className={styles.detailValue}>{item.contact}</span>
                                ) : (
                                    <Link to="/login" className={styles.loginPrompt}>
                                        🔒 Log in to see contact info
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    {!item.resolved && canModify && (
                        <div className={styles.actions}>
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    await resolveItem(item.id);
                                    setItem((i) => ({ ...i, resolved: true }));
                                    toast.success('Marked as resolved!');
                                }}
                            >
                                ✓ Mark Resolved
                            </Button>
                            <Button
                                variant="danger"
                                onClick={async () => {
                                    if (window.confirm('Delete this item?')) {
                                        await deleteItem(item.id);
                                        toast.success('Item deleted.');
                                    }
                                }}
                            >
                                Delete Item
                            </Button>
                        </div>
                    )}

                    {item.resolved && (
                        <div className={styles.resolvedBanner}>
                            ✅ This item has been resolved
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
