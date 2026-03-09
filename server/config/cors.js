const { NODE_ENV, CLIENT_ORIGIN } = require('./env');

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman in dev)
        if (!origin) {
            if (NODE_ENV !== 'production') return callback(null, true);
            return callback(new Error('Origin required in production'), false);
        }

        const allowed = CLIENT_ORIGIN
            ? CLIENT_ORIGIN.split(',').map((o) => o.trim())
            : [];

        if (allowed.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin '${origin}' not allowed`), false);
        }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;
