import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/');
            setMobileMenuOpen(false);
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <motion.nav 
            className="navbar"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🎓 College Events
                    </motion.span>
                </Link>

                <button 
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? '✕' : '☰'}
                </button>

                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                                    <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        Dashboard
                                    </motion.span>
                                </Link>
                            )}
                            <Link to="/profile" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    Profile
                                </motion.span>
                            </Link>
                            <motion.button
                                className="btn btn-secondary"
                                onClick={handleLogout}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Logout
                            </motion.button>
                            <div className="navbar-user">
                                <span className="user-name">{user.name}</span>
                                {user.role === 'admin' && (
                                    <span className="user-badge">Admin</span>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                <motion.button
                                    className="btn btn-secondary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Login
                                </motion.button>
                            </Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                <motion.button
                                    className="btn btn-primary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sign Up
                                </motion.button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;