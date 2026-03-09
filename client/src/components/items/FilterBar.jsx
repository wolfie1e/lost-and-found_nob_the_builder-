import { useState } from 'react';
import styles from './FilterBar.module.css';
import { CATEGORIES } from '../../constants/categories';

const TYPE_FILTERS = [
    { value: 'all', label: 'All Items' },
    { value: 'lost', label: '❌ Lost' },
    { value: 'found', label: '✅ Found' },
];

export default function FilterBar({ filters, onChange }) {
    const [searchValue, setSearchValue] = useState(filters.q || '');

    const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

    const handleSearch = (e) => {
        e.preventDefault();
        set('q', searchValue);
    };

    return (
        <div className={styles.bar}>
            {/* Search */}
            <form onSubmit={handleSearch} className={styles.searchForm} role="search">
                <div className={styles.searchWrap}>
                    <span className={styles.searchIcon} aria-hidden="true">🔍</span>
                    <input
                        type="search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search by title or description…"
                        className={styles.search}
                        aria-label="Search items"
                    />
                    <button type="submit" className={styles.searchBtn}>Search</button>
                </div>
            </form>

            {/* Filter row */}
            <div className={styles.filterRow}>
                {/* Type chips */}
                <div className={styles.chips} role="group" aria-label="Filter by type">
                    {TYPE_FILTERS.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => set('type', value)}
                            className={[styles.chip, filters.type === value ? styles.chipActive : ''].join(' ')}
                            aria-pressed={filters.type === value}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Category select */}
                <select
                    className={styles.select}
                    value={filters.category || ''}
                    onChange={(e) => set('category', e.target.value || undefined)}
                    aria-label="Filter by category"
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(({ value, label, icon }) => (
                        <option key={value} value={value}>{icon} {label}</option>
                    ))}
                </select>

                {/* Resolved toggle */}
                <label className={styles.toggle}>
                    <input
                        type="checkbox"
                        checked={filters.resolved === 'true'}
                        onChange={(e) => set('resolved', e.target.checked ? 'true' : 'false')}
                    />
                    Show resolved
                </label>
            </div>
        </div>
    );
}
