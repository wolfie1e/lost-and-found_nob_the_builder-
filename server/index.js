const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory store — swap for a DB later
let items = [
  {
    id: uuidv4(),
    type: 'lost',
    title: 'Blue Umbrella',
    description: 'Left at the lobby near the entrance',
    location: 'Main Lobby',
    contact: 'alex@example.com',
    date: new Date().toISOString(),
    resolved: false,
  },
  {
    id: uuidv4(),
    type: 'found',
    title: 'Black Wallet',
    description: 'Found on the bench outside. Has some cards inside.',
    location: 'East Garden',
    contact: 'security@example.com',
    date: new Date().toISOString(),
    resolved: false,
  },
];

// GET all items (supports ?type=lost|found&resolved=false)
app.get('/api/items', (req, res) => {
  let result = [...items];
  if (req.query.type) result = result.filter(i => i.type === req.query.type);
  if (req.query.resolved !== undefined)
    result = result.filter(i => i.resolved === (req.query.resolved === 'true'));
  res.json(result.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

// GET single item
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create item
app.post('/api/items', (req, res) => {
  const { type, title, description, location, contact } = req.body;
  if (!type || !title || !location || !contact)
    return res.status(400).json({ error: 'type, title, location, contact are required' });
  const item = {
    id: uuidv4(),
    type,
    title,
    description: description || '',
    location,
    contact,
    date: new Date().toISOString(),
    resolved: false,
  };
  items.push(item);
  res.status(201).json(item);
});

// PATCH mark resolved
app.patch('/api/items/:id/resolve', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  item.resolved = true;
  res.json(item);
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
  const idx = items.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  items.splice(idx, 1);
  res.status(204).end();
});

app.listen(PORT, () => console.log(`Lost & Found API running on http://localhost:${PORT}`));
