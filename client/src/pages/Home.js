import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import EventCard from '../components/EventCard';
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchEvents = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/events`, {
                withCredentials: true
            });
            setEvents(response.data);
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

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="home-page">
            <motion.div 
                className="hero-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="container">
                    <motion.h1 
                        className="hero-title"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Discover Amazing College Events
                    </motion.h1>
                    <motion.p 
                        className="hero-subtitle"
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        Register for exciting events, workshops, and activities happening around campus
                    </motion.p>
                </div>
            </motion.div>

            <div className="container">
                <motion.div 
                    className="events-section"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <h2 className="section-title">Upcoming Events</h2>

                    {events.length === 0 ? (
                        <div className="no-events">
                            <p>No events available at the moment.</p>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.map((event, index) => (
                                <EventCard 
                                    key={event._id} 
                                    event={event}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Home;