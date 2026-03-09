# 📦 Lost & Found

A minimal, extensible Lost & Found app — Express REST API + React frontend.

## Project Structure

```
lost-and-found/
├── server/          # Express REST API (port 3001)
│   ├── index.js     # All routes + in-memory store
│   └── package.json
└── client/          # React + Vite frontend (port 3000)
    ├── src/
    │   ├── main.jsx
    │   └── App.jsx  # Everything lives here for now
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Getting Started

### 1. Start the server
```bash
cd server
npm install
npm run dev       # or: npm start
```

### 2. Start the client
```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000

---

## API Reference

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /api/items                | List items (filterable)  |
| GET    | /api/items/:id            | Get single item          |
| POST   | /api/items                | Create item              |
| PATCH  | /api/items/:id/resolve    | Mark item resolved       |
| DELETE | /api/items/:id            | Delete item              |

**Query params for GET /api/items:**
- `type=lost|found`
- `resolved=true|false`

**POST body:**
```json
{
  "type": "lost",
  "title": "Black Backpack",
  "description": "Has a red keychain",
  "location": "3rd Floor Cafeteria",
  "contact": "you@example.com"
}
```

---

## Easy Ways to Extend

- **Persistence**: Replace the `items` array in `server/index.js` with SQLite (`better-sqlite3`) or Postgres (`pg`)
- **Search**: Add `?q=keyword` filter in the GET route
- **Images**: Add `multer` for file uploads, store path in item
- **Auth**: Add JWT middleware to protect POST/DELETE
- **Categories**: Add a `category` field (keys, clothing, electronics…)
- **Notifications**: Send email via nodemailer when an item is resolved
- **Map view**: Render a map using `leaflet` with item locations pinned
