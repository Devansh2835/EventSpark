const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const Event = require('../models/Event');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Configure multer for memory storage (we'll upload to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload image to Cloudinary
router.post('/upload', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'college-events',
                    resource_type: 'auto',
                    public_id: `event-${Date.now()}`
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        // If the client requests only the current user's events (admin dashboard),
        // require authentication and return events organised by the current user.
        if (req.query.mine === 'true') {
            if (!req.session || !req.session.userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const events = await Event.find({ organiser: req.session.userId })
                .populate('organiser', 'name email')
                .sort({ date: 1 });
            return res.json(events);
        }

        const events = await Event.find()
            .populate('organiser', 'name email')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Check if user is organiser (Must come before /:id to avoid route conflict)
router.get('/:id/is-organiser', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const isOrganiser = event.organiser.toString() === req.session.userId && req.session.role === 'admin';

        res.json({ isOrganiser });
    } catch (error) {
        console.error('Error checking organiser:', error);
        res.status(500).json({ error: 'Failed to check organiser status' });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organiser', 'name email')
            .populate('registeredStudents', 'name email');

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
});

// Create event (Admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, description, date, time, venue, image, imagePublicId, maxCapacity } = req.body;

        const event = new Event({
            title,
            description,
            date,
            time,
            venue,
            image,
            imagePublicId,
            maxCapacity,
            organiser: req.session.userId
        });

        await event.save();
        await event.populate('organiser', 'name email');

        res.status(201).json({
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Update event (Admin - only if organiser)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is the organiser
        if (event.organiser.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'You can only edit events you organize' });
        }

        const { title, description, date, time, venue, image, imagePublicId, maxCapacity } = req.body;

        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.time = time || event.time;
        event.venue = venue || event.venue;
        event.maxCapacity = maxCapacity || event.maxCapacity;

        // If a new image public id is provided and differs from the existing one,
        // delete the previous image from Cloudinary (if present) and store the new values.
        if (imagePublicId && imagePublicId !== event.imagePublicId) {
            try {
                if (event.imagePublicId) {
                    await cloudinary.uploader.destroy(event.imagePublicId, { resource_type: 'image' });
                }
            } catch (destroyErr) {
                console.error('Failed to delete old Cloudinary image:', destroyErr);
                // Continue — don't block the update if deletion fails
            }

            event.image = image || event.image;
            event.imagePublicId = imagePublicId;
        } else if (image) {
            // If client only supplied image URL (without public id), update URL but keep existing public id
            event.image = image;
        }

        await event.save();
        await event.populate('organiser', 'name email');

        res.json({
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// Delete event (Admin - only if organiser)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is the organiser
        if (event.organiser.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'You can only delete events you organize' });
        }

        // If the event has an associated Cloudinary public id, attempt to delete it
        try {
            if (event.imagePublicId) {
                await cloudinary.uploader.destroy(event.imagePublicId, { resource_type: 'image' });
            }
        } catch (destroyErr) {
            console.error('Failed to delete Cloudinary image during event deletion:', destroyErr);
            // Continue with deletion even if Cloudinary deletion fails
        }

        await Event.findByIdAndDelete(req.params.id);

        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;