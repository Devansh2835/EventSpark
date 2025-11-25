import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const navigate = useNavigate();

    const fetchEvents = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/events?mine=true`, { withCredentials: true });
            setEvents(res.data);
        } catch (error) {
            console.error('Error fetching events:', error);
            toast.error('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this event permanently?')) return;

        setDeletingId(id);
        try {
            await axios.delete(`${API_URL}/events/${id}`, { withCredentials: true });
            toast.success('Event deleted');
            setEvents(events.filter(e => e._id !== id));
        } catch (error) {
            console.error('Delete error:', error);
            const msg = error.response?.data?.error || 'Failed to delete event';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return <div className="loading"><div className="spinner"></div></div>;

    const totalCapacity = events.reduce((sum, ev) => sum + ev.maxCapacity, 0);
    const totalRegistered = events.reduce((sum, ev) => sum + (ev.registeredStudents?.length || 0), 0);

    return (
        <div className="admin-dashboard-page">
            <div className="container">
                <motion.div
                    className="dashboard-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="header-content">
                        <h1 className="dashboard-title">Admin Dashboard</h1>
                        <p className="dashboard-subtitle">Manage and monitor all events</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/events/new" className="btn btn-primary btn-lg">+ Create Event</Link>
                    </motion.div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    className="stats-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <p className="stat-label">Total Events</p>
                            <p className="stat-value">{events.length}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <p className="stat-label">Total Registrations</p>
                            <p className="stat-value">{totalRegistered}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📍</div>
                        <div className="stat-content">
                            <p className="stat-label">Total Capacity</p>
                            <p className="stat-value">{totalCapacity}</p>
                        </div>
                    </div>
                </motion.div>

                {events.length === 0 ? (
                    <motion.div
                        className="no-events-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <p className="no-events-text">No events found. Create your first event to get started!</p>
                        <Link to="/events/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
                            Create Event
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        className="events-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="events-title">All Events</h2>
                        <div className="events-grid">
                            {events.map((ev, index) => (
                                <motion.div
                                    key={ev._id}
                                    className="event-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="event-card-header">
                                        <h3 className="event-title">{ev.title}</h3>
                                        <span className="event-capacity-badge">
                                            {Math.round((ev.registeredStudents?.length || 0) / ev.maxCapacity * 100)}%
                                        </span>
                                    </div>

                                    <div className="event-card-body">
                                        <div className="event-detail">
                                            <span className="detail-icon">📅</span>
                                            <span className="detail-text">{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="event-detail">
                                            <span className="detail-icon">📍</span>
                                            <span className="detail-text">{ev.venue}</span>
                                        </div>
                                        <div className="capacity-bar-container">
                                            <div className="capacity-bar-label">
                                                <span>Capacity</span>
                                                <span className="capacity-numbers">{ev.registeredStudents?.length || 0} / {ev.maxCapacity}</span>
                                            </div>
                                            <div className="capacity-bar">
                                                <div
                                                    className="capacity-bar-fill"
                                                    style={{
                                                        width: `${Math.min((ev.registeredStudents?.length || 0) / ev.maxCapacity * 100, 100)}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="event-card-actions">
                                        <motion.button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => navigate(`/events/${ev._id}/manage`)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            ✏️ Edit
                                        </motion.button>
                                        <motion.button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(ev._id)}
                                            disabled={deletingId === ev._id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {deletingId === ev._id ? '⏳ Deleting...' : '🗑️ Delete'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
