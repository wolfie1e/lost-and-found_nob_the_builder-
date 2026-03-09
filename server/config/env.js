require('dotenv').config();

const required = (name) => {
    if (!process.env[name]) {
        throw new Error(`Missing required env variable: ${name}`);
    }
    return process.env[name];
};

const optional = (name, fallback) => process.env[name] || fallback;

module.exports = {
    NODE_ENV: optional('NODE_ENV', 'development'),
    PORT: parseInt(optional('PORT', '3001'), 10),
    CLIENT_ORIGIN: optional('CLIENT_ORIGIN', 'http://localhost:3000'),

    // JWT — will throw if missing in Phase 2
    JWT_SECRET: optional('JWT_SECRET', 'dev_secret_replace_me'),
    JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '15m'),
    JWT_REFRESH_SECRET: optional('JWT_REFRESH_SECRET', 'dev_refresh_replace_me'),
    JWT_REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),

    // Database
    DATABASE_URL: optional('DATABASE_URL', null),

    // Ollama
    OLLAMA_BASE_URL: optional('OLLAMA_BASE_URL', 'http://localhost:11434'),
    OLLAMA_MODEL: optional('OLLAMA_MODEL', 'llama3.2'),
    OLLAMA_TIMEOUT: parseInt(optional('OLLAMA_TIMEOUT', '30000'), 10),
};
