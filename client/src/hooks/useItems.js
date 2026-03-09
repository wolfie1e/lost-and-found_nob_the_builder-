import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getItems, resolveItem, deleteItem } from '../api/items';

export function useItems(filters) {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, meta: m } = await getItems(filters);
            setItems(data);
            setMeta(m);
        } catch (err) {
            setError(err.message || 'Failed to load items');
            toast.error('Failed to load items. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleResolve = useCallback(async (id) => {
        try {
            await resolveItem(id);
            setItems((prev) => prev.map((i) => i.id === id ? { ...i, resolved: true } : i));
        } catch (err) {
            toast.error(err.message || 'Failed to resolve item.');
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            await deleteItem(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
            setMeta((m) => ({ ...m, total: m.total - 1 }));
        } catch (err) {
            toast.error(err.message || 'Failed to delete item.');
        }
    }, []);

    return { items, meta, loading, error, refetch: fetchItems, handleResolve, handleDelete };
}
