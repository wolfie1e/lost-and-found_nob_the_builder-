import { useAuth } from '../hooks/useAuth';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/items/ItemCard';
import EmptyState from '../components/ui/EmptyState';
import styles from './AdminPage.module.css';

export default function AdminPage() {
    const { user } = useAuth();
    const { items, loading, handleResolve, handleDelete } = useItems({ resolved: undefined });

    return (
        <div className="container page-enter">
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                    <p className={styles.subtitle}>Manage all reported items on the platform.</p>
                </div>
                <div className={styles.badge}>👑 {user?.name}</div>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statNum}>{items.length}</span>
                    <span className={styles.statLabel}>Total Items</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statNum}>{items.filter((i) => i.type === 'lost').length}</span>
                    <span className={styles.statLabel}>Lost</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statNum}>{items.filter((i) => i.type === 'found').length}</span>
                    <span className={styles.statLabel}>Found</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statNum}>{items.filter((i) => i.resolved).length}</span>
                    <span className={styles.statLabel}>Resolved</span>
                </div>
            </div>

            {/* Item Grid */}
            {loading ? (
                <p className={styles.loading}>Loading all items…</p>
            ) : items.length === 0 ? (
                <EmptyState icon="📭" title="No items on the platform yet." />
            ) : (
                <div className={styles.grid}>
                    {items.map((item) => (
                        <ItemCard key={item.id} item={item} onResolve={handleResolve} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
