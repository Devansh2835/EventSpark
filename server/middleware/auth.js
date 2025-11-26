const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }

    // Helpful debug information (only in non-production environments)
    if (process.env.NODE_ENV !== 'production') {
        try {
            console.debug('isAuthenticated: failing request', {
                origin: req.headers.origin,
                cookie: req.headers.cookie,
                session: req.session
            });
        } catch (err) {
            // swallow debug errors
        }
    }

    return res.status(401).json({ error: 'Unauthorized. Please login.' });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }

    if (process.env.NODE_ENV !== 'production') {
        try {
            console.debug('isAdmin: failing request', {
                origin: req.headers.origin,
                cookie: req.headers.cookie,
                session: req.session
            });
        } catch (err) {
            // swallow debug errors
        }
    }

    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
};

module.exports = { isAuthenticated, isAdmin };