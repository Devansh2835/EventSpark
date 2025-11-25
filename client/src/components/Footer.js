import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <span className="logo">🎓 College Events</span>
                    <p className="tagline">Bringing campus activities to life</p>
                </div>

                <div className="footer-links">
                    <div>
                        <h4>Resources</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/events/new">Create Event</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Company</h4>
                        <ul>
                            <li><a href="/about">About</a></li>
                            <li><a href="/contact">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="/terms">Terms</a></li>
                            <li><a href="/privacy">Privacy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {new Date().getFullYear()} College Event Manager. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;