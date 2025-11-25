require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');

const app = express();

// Middleware
// CORS configuration
if (process.env.NODE_ENV === 'production') {
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
    }));
} else {
    // In development allow any localhost origin (useful when CRA picks another port)
    app.use(cors({
        origin: (origin, callback) => {
            // allow requests with no origin (like mobile apps or curl)
            if (!origin) return callback(null, true);
            try {
                const url = new URL(origin);
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            } catch (err) {
                // ignore parse errors
            }
            // fallback to environment config
            if (origin === process.env.FRONTEND_URL) return callback(null, true);
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true
    }));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'college-event-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/college-event-manager'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        sameSite: 'lax'
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