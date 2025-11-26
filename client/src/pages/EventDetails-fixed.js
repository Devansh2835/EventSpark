import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, checkAuth } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isOrganiser, setIsOrganiser] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchEvent = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/events/${id}`, {
                withCredentials: true
            });
            setEvent(response.data);
        } catch (error) {
            console.error('Error fetching event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    }, [API_URL, id]);

    const checkRegistration = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_URL}/registrations/check/${id}`, {
                withCredentials: true
            });
            setIsRegistered(response.data.isRegistered);
        } catch (error) {
            console.error('Error checking registration:', error);
            // If unauthorized, redirect to login
            if (error.response?.status === 401) {
                toast.info('Please login to check registration status');
                setIsRegistered(false);
            }
        }
    }, [API_URL, id, user]);

    const checkIfOrganiser = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_URL}/events/${id}/is-organiser`, {
                withCredentials: true
            });
            setIsOrganiser(response.data.isOrganiser);
        } catch (error) {
            console.error('Error checking organiser:', error);
            setIsOrganiser(false);
        }
    }, [API_URL, id, user]);

    useEffect(() => {
        fetchEvent();
        if (user) {
            checkRegistration();
            checkIfOrganiser();
        }
    }, [id, user, fetchEvent, checkRegistration, checkIfOrganiser]);

    const handleRegister = async () => {
        if (!user) {
            toast.info('Please login to register for events');
            navigate('/login');
            return;
        }

        setRegistering(true);
        try {
            const response = await axios.post(
                `${API_URL}/registrations`,
                { eventId: id },
                { withCredentials: true }
            );
            toast.success('Registration successful!');
            navigate(`/registration-success/${response.data.registration._id}`);
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed';
            
            // Handle specific authentication errors
            if (error.response?.status === 401) {
                toast.error('Please login to register for this event');
                navigate('/login');
            } else {
                toast.error(message);
            }
        } finally {
            setRegistering(false);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <h2>Event not found</h2>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>
                    Back to Home
                </Link>
            </div>
        );
    }

    const isEventFull = event.registeredStudents?.length >= event.maxCapacity;
    const spotsLeft = event.maxCapacity - (event.registeredStudents?.length || 0);
    
    return (
        <div className="event-details-page">
            <motion.div
                className="event-details-hero"
                style={{ backgroundImage: `url(${event.image})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="hero-overlay"></div>
            </motion.div>

            <div className="container">
                <motion.div
                    className="event-details-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="event-header">
                        <div className="event-header-main">
                            <h1 className="event-title">{event.title}</h1>
                            <div className="event-meta">
                                <span className="meta-item">
                                    📅 {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                                </span>
                                <span className="meta-item">
                                    🕐 {event.time}
                                </span>
                                <span className="meta-item">
                                    📍 {event.venue}
                                </span>
                            </div>
                        </div>

                        {user && isOrganiser && (
                            <Link to={`/events/${id}/manage`} className="btn btn-secondary">
                                ⚙️ Manage Event
                            </Link>
                        )}
                    </div>

                    <div className="event-details-grid">
                        <div className="event-main">
                            <div className="event-section">
                                <h2 className="section-heading">About This Event</h2>
                                <p className="event-description">{event.description}</p>
                            </div>

                            <div className="event-section">
                                <h2 className="section-heading">Organiser</h2>
                                <div className="organiser-card">
                                    <div className="organiser-avatar">
                                        {event.organiser?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="organiser-info">
                                        <h3 className="organiser-name">{event.organiser?.name}</h3>
                                        <p className="organiser-email">{event.organiser?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="event-sidebar">
                            <div className="registration-card">
                                <div className="capacity-badge">
                                    <span className="capacity-number">
                                        {event.registeredStudents?.length || 0}/{event.maxCapacity}
                                    </span>
                                    <span className="capacity-label">Registered</span>
                                </div>

                                {spotsLeft > 0 && spotsLeft <= 20 && (
                                    <div className="spots-warning">
                                        ⚠️ Only {spotsLeft} spots left!
                                    </div>
                                )}

                                {isRegistered ? (
                                    <div className="registered-status">
                                        <span className="status-icon">✓</span>
                                        <span className="status-text">You're Registered!</span>
                                    </div>
                                ) : (
                                    <motion.button
                                        className="btn btn-primary btn-full btn-large"
                                        onClick={handleRegister}
                                        disabled={registering || isEventFull || !user}
                                        whileHover={{ scale: user ? 1.02 : 1 }}
                                        whileTap={{ scale: user ? 0.98 : 1 }}
                                    >
                                        {registering ? 'Registering...' 
                                         : isEventFull ? 'Event Full'
                                         : !user ? 'Login to Register'
                                         : 'Register Now'}
                                    </motion.button>
                                )}

                                {!user && (
                                    <p className="login-hint">
                                        <Link to="/login">Login</Link> or <Link to="/register">Sign up</Link> to register
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default EventDetails;