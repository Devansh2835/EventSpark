const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please login.', code: 'UNAUTHORIZED' });
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }
    return res.status(403).json({ error: 'Forbidden. Admin access required.', code: 'FORBIDDEN' });
};

module.exports = { isAuthenticated, isAdmin };