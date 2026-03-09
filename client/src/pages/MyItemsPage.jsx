import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useAuth } from '../hooks/useAuth';
import ItemCard from '../components/items/ItemCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import styles from './MyItemsPage.module.css';

export default function MyItemsPage() {
    const { user } = useAuth();
    const [showResolved, setShowResolved] = useState(false);
    // Note: once backend has auth, add userId filter: { userId: user.id }
    const { items, loading, handleResolve, handleDelete } = useItems({ resolved: showResolved ? undefined : 'false' });

    const myItems = items.filter((i) => i.userId === user?.id || !i.userId); // Phase 2: remove fallback

    return (
        <div className="container page-enter">
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>My Items</h1>
                    <p className={styles.subtitle}>Items you have reported on this platform.</p>
                </div>
                <Link to="/report"><Button>+ Report New Item</Button></Link>
            </div>

            <div className={styles.toggleRow}>
                <label className={styles.toggle}>
                    <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
                    Show resolved items
                </label>
                <span className={styles.count}>{myItems.length} item{myItems.length !== 1 ? 's' : ''}</span>
            </div>

            {loading ? (
                <p className={styles.loading}>Loading your items…</p>
            ) : myItems.length === 0 ? (
                <EmptyState
                    icon="📭"
                    title="No items yet"
                    description="You haven't reported any items. Start by reporting a lost or found item."
                    action={<Link to="/report"><Button>Report an Item</Button></Link>}
                />
            ) : (
                <div className={styles.grid}>
                    {myItems.map((item) => (
                        <ItemCard key={item.id} item={item} onResolve={handleResolve} onDelete={handleDelete} />
                    ))}
                </div>
            )}
        </div>
    );
}
