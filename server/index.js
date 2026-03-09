/**
 * Server entrypoint — starts the HTTP server.
 * The Express app is defined in app.js (importable without side effects for tests).
 */
require('./config/env'); // Load env vars first
const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');

app.listen(PORT, () => {
  console.log(`[server] Lost & Found API running on http://localhost:${PORT} (${NODE_ENV})`);
});

