import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchRegistrations = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/registrations/my-registrations`, {
                withCredentials: true
            });
            setRegistrations(response.data);
        } catch (error) {
            console.error('Error fetching registrations:', error);
            toast.error('Failed to load registrations');
        } finally {
            setLoading(false);
        }

    }, [API_URL]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="container">
                <motion.div
                    className="profile-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="profile-avatar">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h1 className="profile-name">{user?.name}</h1>
                        <p className="profile-email">{user?.email}</p>
                        {user?.role === 'admin' && (
                            <span className="profile-badge">Admin</span>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    className="profile-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="section-title">My Registered Events</h2>

                    {registrations.length === 0 ? (
                        <div className="no-registrations">
                            <p>You haven't registered for any events yet.</p>
                            <Link to="/" className="btn btn-primary">
                                Browse Events
                            </Link>
                        </div>
                    ) : (
                        <div className="registrations-list">
                            {registrations.map((registration, index) => (
                                <motion.div
                                    key={registration._id}
                                    className="registration-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <div className="registration-image">
                                        <img 
                                            src={registration.event.image} 
                                            alt={registration.event.title} 
                                        />
                                    </div>
                                    <div className="registration-details">
                                        <h3 className="registration-title">
                                            {registration.event.title}
                                        </h3>
                                        <div className="registration-meta">
                                            <span className="meta-item">
                                                📅 {format(new Date(registration.event.date), 'MMM dd, yyyy')}
                                            </span>
                                            <span className="meta-item">
                                                🕐 {registration.event.time}
                                            </span>
                                            <span className="meta-item">
                                                📍 {registration.event.venue}
                                            </span>
                                        </div>
                                        <div className="registration-footer">
                                            <span className="registered-date">
                                                Registered on {format(new Date(registration.registrationDate), 'MMM dd, yyyy')}
                                            </span>
                                            <Link 
                                                to={`/registration-success/${registration._id}`}
                                                className="btn btn-secondary btn-sm"
                                            >
                                                View QR Code
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;