require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security headers
app.use(helmet());

// Basic rate limiting to mitigate brute-force and abusive requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Middleware
// CORS configuration - Critical for Vercel (frontend) to Render (backend) communication
const allowedOrigins = [
    // Development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    // Production - Allow Vercel deployments
    /^https:\/\/.*\.vercel\.app$/,
];

// Add configured frontend URL if provided
const configuredFrontend = process.env.FRONTEND_URL;
if (configuredFrontend) {
    allowedOrigins.push(configuredFrontend);
    console.log('CORS: Added configured FRONTEND_URL:', configuredFrontend);
}

if (process.env.NODE_ENV === 'production') {
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (server-to-server, curl, Postman)
            if (!origin) return callback(null, true);
            
            try {
                // Check against allowed origins
                const isAllowed = allowedOrigins.some(allowed => {
                    if (allowed instanceof RegExp) {
                        return allowed.test(origin);
                    }
                    return allowed === origin;
                });

                if (isAllowed) {
                    return callback(null, true);
                }
            } catch (err) {
                console.error('CORS check error:', err);
            }
            
            console.warn('CORS blocked request from:', origin);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        optionsSuccessStatus: 200
    }));
} else {
    // In development, be more permissive
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            try {
                const url = new URL(origin);
                // Allow localhost in development
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            } catch (err) {
                // ignore parse errors
            }
            // Also allow configured frontend
            if (origin === configuredFrontend) return callback(null, true);
            callback(null, true); // More permissive in dev
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// When running behind a proxy (Render), trust the first proxy so secure cookies
// and other proxy-related headers behave correctly in production.
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'college-event-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/college-event-manager'
    }),
    // Configure cookie security based on environment. For cross-site cookies
    // (client on Vercel, server on Render) we need `sameSite: 'none'` and
    // `secure: true` in production and enable trust proxy above.
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-event-manager')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});