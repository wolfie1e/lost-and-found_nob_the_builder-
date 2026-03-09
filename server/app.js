const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

const { NODE_ENV } = require('./config/env');
const corsOptions = require('./config/cors');
const { apiLimiter, mutationLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { validate, createItemRules } = require('./validators/item.validator');
const { authenticate } = require('./middleware/auth');
const { router: authRouter } = require('./routes/auth');
const { router: chatRouter } = require('./routes/chat');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
if (NODE_ENV !== 'test') {
    app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev')); // Suppress logs in tests
}
app.use('/api/', apiLimiter);

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);

// ─── Chat Routes ──────────────────────────────────────────────────────────────
app.use('/api/chat', chatRouter);

// ─── In-Memory Store (Phase 5 replaces with PostgreSQL) ──────────────────────
let items = [
    {
        id: uuidv4(),
        type: 'lost',
        title: 'Blue Umbrella',
        description: 'Left at the lobby near the entrance',
        location: 'Main Lobby',
        contact: 'alex@example.com',
        category: 'other',
        date: new Date().toISOString(),
        resolved: false,
        userId: null,
    },
    {
        id: uuidv4(),
        type: 'found',
        title: 'Black Wallet',
        description: 'Found on the bench outside. Has some cards inside.',
        location: 'East Garden',
        contact: 'security@example.com',
        category: 'wallet',
        date: new Date().toISOString(),
        resolved: false,
        userId: null,
    },
];

// Make items accessible to all routes (for chatbot retrieval)
app.set('items', items);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: NODE_ENV });
});

// ─── GET /api/items — List with filters and pagination ───────────────────────
app.get('/api/items', apiLimiter, (req, res) => {
    let result = [...items];

    if (req.query.type && ['lost', 'found'].includes(req.query.type)) {
        result = result.filter((i) => i.type === req.query.type);
    }

    if (req.query.resolved !== undefined) {
        result = result.filter((i) => i.resolved === (req.query.resolved === 'true'));
    }

    if (req.query.category) {
        result = result.filter((i) => i.category === req.query.category);
    }

    if (req.query.q) {
        const q = req.query.q.toLowerCase().trim().slice(0, 100);
        result = result.filter(
            (i) =>
                i.title.toLowerCase().includes(q) ||
                (i.description && i.description.toLowerCase().includes(q))
        );
    }

    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    res.json({ status: 'ok', data: paginated, meta: { total, page, limit, totalPages } });
});

// ─── GET /api/items/:id ───────────────────────────────────────────────────────
app.get('/api/items/:id', (req, res) => {
    const item = items.find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
    res.json({ status: 'ok', data: item });
});

// ─── POST /api/items ─────────────────────────────────────────────────────────
app.post('/api/items', mutationLimiter, authenticate, validate(createItemRules), (req, res) => {
    const { type, title, description, location, contact, category } = req.body;
    const item = {
        id: uuidv4(),
        type,
        title,
        description: description || '',
        location,
        contact,
        category: category || 'other',
        date: new Date().toISOString(),
        resolved: false,
        userId: req.user.id,
    };
    items.push(item);
    app.set('items', items); // Update for chatbot
    res.status(201).json({ status: 'ok', data: item });
});

// ─── PATCH /api/items/:id/resolve ────────────────────────────────────────────
app.patch('/api/items/:id/resolve', mutationLimiter, authenticate, (req, res) => {
    const item = items.find((i) => i.id === req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
    if (item.userId && item.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Not authorized to resolve this item.' });
    }
    item.resolved = true;
    item.resolvedAt = new Date().toISOString();
    app.set('items', items); // Update for chatbot
    res.json({ status: 'ok', data: item });
});

// ─── DELETE /api/items/:id ────────────────────────────────────────────────────
app.delete('/api/items/:id', mutationLimiter, authenticate, (req, res) => {
    const idx = items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ status: 'error', message: 'Item not found' });
    const item = items[idx];
    if (item.userId && item.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ status: 'error', message: 'Not authorized to delete this item.' });
    }
    items.splice(idx, 1);
    app.set('items', items); // Update for chatbot
    res.status(204).end();
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
