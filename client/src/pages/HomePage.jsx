import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import { useAuth } from '../hooks/useAuth';
import FilterBar from '../components/items/FilterBar';
import ItemCard from '../components/items/ItemCard';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import styles from './HomePage.module.css';

const INITIAL_FILTERS = { type: 'all', resolved: 'false', category: '', q: '', page: 1, limit: 20 };

export default function HomePage() {
    const { user } = useAuth();
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const { items, meta, loading, error, handleResolve, handleDelete } = useItems(filters);

    return (
        <div className="container page-enter">
            {/* Hero */}
            <section className={styles.hero}>
                <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>
                        Campus Lost <span className={styles.heroAmp}>&</span> Found
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Reuniting students with their belongings — one item at a time.
                    </p>
                </div>
                <div className={styles.heroActions}>
                    {user ? (
                        <Link to="/report">
                            <Button size="lg" variant="primary">+ Report an Item</Button>
                        </Link>
                    ) : (
                        <Link to="/register">
                            <Button size="lg" variant="primary">Get Started</Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* Stats Bar */}
            <div className={styles.statsBar} aria-live="polite">
                <span className={styles.statsCount}>
                    {loading ? '…' : `${meta.total} item${meta.total !== 1 ? 's' : ''} found`}
                </span>
                {!user && (
                    <span className={styles.statsHint}>
                        <Link to="/login" className={styles.statsLink}>Log in</Link> to report items &amp; see contact info
                    </span>
                )}
            </div>

            {/* Filters */}
            <FilterBar filters={filters} onChange={setFilters} />

            {/* Error state */}
            {error && (
                <EmptyState
                    icon="⚠️"
                    title="Could not load items"
                    description={error}
                />
            )}

            {/* List */}
            {loading ? (
                <div className={styles.grid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className={[styles.skeletonLine, styles.skeletonBadge].join(' ')} />
                            <div className={[styles.skeletonLine, styles.skeletonTitle].join(' ')} />
                            <div className={[styles.skeletonLine, styles.skeletonDesc].join(' ')} />
                            <div className={[styles.skeletonLine, styles.skeletonMeta].join(' ')} />
                        </div>
                    ))}
                </div>
            ) : !error && items.length === 0 ? (
                <EmptyState
                    icon="📭"
                    title="No items found"
                    description={
                        filters.q
                            ? `No results for "${filters.q}". Try different keywords.`
                            : 'No items match your current filters.'
                    }
                    action={
                        <Button variant="secondary" onClick={() => setFilters(INITIAL_FILTERS)}>
                            Clear Filters
                        </Button>
                    }
                />
            ) : (
                <>
                    <div className={styles.grid}>
                        {items.map((item) => (
                            <ItemCard
                                key={item.id}
                                item={item}
                                onResolve={handleResolve}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className={styles.pagination} aria-label="Pagination">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={meta.page <= 1}
                                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                            >
                                ← Previous
                            </Button>
                            <span className={styles.pageInfo}>Page {meta.page} of {meta.totalPages}</span>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={meta.page >= meta.totalPages}
                                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                            >
                                Next →
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
