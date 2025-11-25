import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'react-toastify';
import './RegistrationSuccess.css';

const RegistrationSuccess = () => {
    const { id } = useParams();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchRegistration = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/registrations/${id}`, {
                withCredentials: true
            });
            setRegistration(response.data);
        } catch (error) {
            console.error('Error fetching registration:', error);
            toast.error('Failed to load registration details');
        } finally {
            setLoading(false);
        }
    }, [API_URL, id]);

    useEffect(() => {
        fetchRegistration();
    }, [id, fetchRegistration]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h2>Registration not found</h2>
                <Link to="/profile" className="btn btn-primary" style={{ marginTop: '20px' }}>
                    View My Registrations
                </Link>
            </div>
        );
    }

    return (
        <div className="registration-success-page">
            <div className="container">
                <motion.div
                    className="success-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="success-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                    >
                        ✓
                    </motion.div>

                    <motion.h1
                        className="success-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        Congratulations!
                    </motion.h1>

                    <motion.p
                        className="success-message"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        You have successfully registered for this event
                    </motion.p>

                    <motion.div
                        className="event-info-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h2 className="event-name">{registration.event.title}</h2>
                        <div className="event-details-grid-success">
                            <div className="detail-item">
                                <span className="detail-icon">📅</span>
                                <span className="detail-text">
                                    {format(new Date(registration.event.date), 'EEEE, MMMM dd, yyyy')}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">🕐</span>
                                <span className="detail-text">{registration.event.time}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-icon">📍</span>
                                <span className="detail-text">{registration.event.venue}</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="qr-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <h3 className="qr-title">Your RSVP QR Code</h3>
                        <p className="qr-subtitle">
                            Show this QR code at the venue for entry
                        </p>
                        <div className="qr-code-container">
                            <img 
                                src={registration.qrCode} 
                                alt="Event QR Code" 
                                className="qr-code"
                            />
                        </div>
                        <p className="qr-info">
                            A confirmation email with this QR code has been sent to your email address
                        </p>
                    </motion.div>

                    <motion.div
                        className="action-buttons"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <Link to="/" className="btn btn-primary">
                            Browse More Events
                        </Link>
                        <Link to="/profile" className="btn btn-secondary">
                            View My Registrations
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;