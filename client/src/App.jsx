import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api';

const TAGS = {
  lost: { label: 'Lost', color: '#e55' },
  found: { label: 'Found', color: '#2a9d8f' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Tag({ type }) {
  return (
    <span style={{
      background: TAGS[type].color,
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1,
      padding: '2px 8px',
      borderRadius: 3,
      textTransform: 'uppercase',
    }}>{TAGS[type].label}</span>
  );
}

function ItemCard({ item, onResolve, onDelete }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8e8e8',
      borderRadius: 8,
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      opacity: item.resolved ? 0.5 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tag type={item.type} />
        <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{item.title}</span>
        <span style={{ fontSize: 12, color: '#aaa' }}>{timeAgo(item.date)}</span>
      </div>
      {item.description && (
        <p style={{ margin: 0, fontSize: 13, color: '#555' }}>{item.description}</p>
      )}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', marginTop: 2 }}>
        <span>📍 {item.location}</span>
        <span>✉️ {item.contact}</span>
      </div>
      {!item.resolved && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button onClick={() => onResolve(item.id)} style={btnStyle('#2a9d8f')}>
            ✓ Mark Resolved
          </button>
          <button onClick={() => onDelete(item.id)} style={btnStyle('#ccc', '#333')}>
            Delete
          </button>
        </div>
      )}
      {item.resolved && (
        <span style={{ fontSize: 12, color: '#2a9d8f', fontWeight: 600 }}>✓ Resolved</span>
      )}
    </div>
  );
}

function btnStyle(bg, color = '#fff') {
  return {
    background: bg,
    color,
    border: 'none',
    borderRadius: 5,
    padding: '5px 12px',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  };
}

const EMPTY_FORM = { type: 'lost', title: '', description: '', location: '', contact: '' };

export default function App() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all | lost | found
  const [showResolved, setShowResolved] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('type', filter);
    if (!showResolved) params.set('resolved', 'false');
    const res = await fetch(`${API}/items?${params}`);
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, [filter, showResolved]);

  async function handleSubmit() {
    setError('');
    if (!form.title || !form.location || !form.contact) {
      setError('Title, location, and contact are required.');
      return;
    }
    const res = await fetch(`${API}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchItems();
    }
  }

  async function handleResolve(id) {
    await fetch(`${API}/items/${id}/resolve`, { method: 'PATCH' });
    fetchItems();
  }

  async function handleDelete(id) {
    await fetch(`${API}/items/${id}`, { method: 'DELETE' });
    fetchItems();
  }

  const input = (key, placeholder, type = 'text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      style={inputStyle}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>📦 Lost & Found</span>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setShowForm(v => !v)}
            style={{ ...btnStyle('#111'), padding: '7px 16px', fontSize: 13, borderRadius: 6 }}
          >
            + Report Item
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
        {/* Add form */}
        {showForm && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Report an item</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {['lost', 'found'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  style={{
                    ...btnStyle(form.type === t ? TAGS[t].color : '#eee', form.type === t ? '#fff' : '#555'),
                    padding: '6px 16px',
                    borderRadius: 5,
                    textTransform: 'capitalize',
                    fontWeight: 600,
                  }}
                >{t}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {input('title', 'Item title *')}
              {input('description', 'Description (optional)')}
              {input('location', 'Where was it lost/found? *')}
              {input('contact', 'Contact email or phone *')}
            </div>
            {error && <p style={{ color: '#e55', fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={handleSubmit} style={{ ...btnStyle('#111'), padding: '8px 18px', borderRadius: 6 }}>Submit</button>
              <button onClick={() => { setShowForm(false); setError(''); setForm(EMPTY_FORM); }} style={{ ...btnStyle('#eee', '#333'), padding: '8px 14px', borderRadius: 6 }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {['all', 'lost', 'found'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...btnStyle(filter === f ? '#111' : '#fff', filter === f ? '#fff' : '#555'),
                border: '1px solid #ddd',
                padding: '5px 14px',
                borderRadius: 20,
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >{f}</button>
          ))}
          <div style={{ flex: 1 }} />
          <label style={{ fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
            Show resolved
          </label>
        </div>

        {/* List */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>No items found. Be the first to report one!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(item => (
              <ItemCard key={item.id} item={item} onResolve={handleResolve} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
};
