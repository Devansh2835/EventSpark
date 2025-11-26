import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './ManageEvent.css';

const CreateEvent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        image: '',
        imagePublicId: '',
        maxCapacity: 200
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // Check if user is logged in and has admin role
    useEffect(() => {
        if (!user) {
            toast.info('Please login to create events');
            navigate('/login');
            return;
        }
        
        if (user.role !== 'admin') {
            toast.error('Only administrators can create events');
            navigate('/');
            return;
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToCloudinary = async () => {
        if (!imageFile) {
            toast.error('Please select an image');
            return null;
        }

        setUploading(true);
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);

            const res = await axios.post(`${API_URL}/events/upload`, uploadFormData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const publicId = res.data?.publicId || res.data?.public_id || '';
            setFormData({ ...formData, image: res.data.imageUrl, imagePublicId: publicId });
            toast.success('Image uploaded successfully');
            return res.data.imageUrl;
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.error || 'Failed to upload image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Upload image if a file is selected
        if (imageFile && !formData.image) {
            const imageUrl = await uploadImageToCloudinary();
            if (!imageUrl) return;
            formData.image = imageUrl;
        }

        if (!formData.image) {
            toast.error('Please upload an image');
            return;
        }

        setSaving(true);
        try {
            const res = await axios.post(`${API_URL}/events`, formData, { withCredentials: true });
            toast.success('Event created');
            navigate(`/events/${res.data.event._id}/manage`);
        } catch (error) {
            console.error('Create error:', error);
            const msg = error.response?.data?.error || 'Failed to create event';
            
            // Handle specific authentication errors
            if (error.response?.status === 401) {
                toast.error('Please login to create events');
                navigate('/login');
            } else if (error.response?.status === 403) {
                toast.error('Only administrators can create events');
                navigate('/');
            } else {
                toast.error(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="manage-event-page">
            <div className="container">
                <motion.div
                    className="manage-event-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="page-header">
                        <h1 className="page-title">Create Event</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="manage-event-form">
                        <div className="form-group">
                            <label htmlFor="title">Event Title *</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter event title" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description *</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter event description" rows="6" required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="date">Date *</label>
                                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="time">Time *</label>
                                <input type="text" id="time" name="time" value={formData.time} onChange={handleChange} placeholder="e.g., 10:00 AM - 2:00 PM" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="venue">Venue *</label>
                            <input type="text" id="venue" name="venue" value={formData.venue} onChange={handleChange} placeholder="Enter event venue" required />
                        </div>

                        <div className="form-group">
                            <label htmlFor="imageFile">Event Image *</label>
                            <div className="image-upload-container">
                                <input 
                                    type="file" 
                                    id="imageFile" 
                                    accept="image/*" 
                                    onChange={handleImageSelect}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                />
                                <motion.label 
                                    htmlFor="imageFile"
                                    className="image-upload-label"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {uploading ? '⏳ Uploading...' : imageFile ? '✓ Image Selected' : '📸 Click to Select Image'}
                                </motion.label>
                            </div>
                            {imagePreview && (
                                <div className="image-preview">
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}
                            {formData.image && !imageFile && (
                                <p style={{ color: 'var(--color-success)', marginTop: '8px' }}>✓ Image uploaded: {formData.image.substring(0, 50)}...</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxCapacity">Maximum Capacity *</label>
                            <input type="number" id="maxCapacity" name="maxCapacity" value={formData.maxCapacity} onChange={handleChange} min="1" required />
                        </div>

                        <div className="form-actions">
                            <motion.button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving || uploading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {saving ? 'Creating...' : 'Create Event'}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateEvent;