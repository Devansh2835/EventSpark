const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const { generateQRCode } = require('../utils/qrGenerator');
const { sendEventRegistrationEmail } = require('../utils/emailService');

// Register for an event
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.session.userId;

        // Check if event exists
        const event = await Event.findById(eventId).populate('organiser', 'name email');
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            user: userId,
            event: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }

        // Check capacity
        if (event.registeredStudents.length >= event.maxCapacity) {
            return res.status(400).json({ error: 'Event is full' });
        }

        // Generate unique QR code data
        const qrData = {
            registrationId: `REG-${Date.now()}-${userId}`,
            userId: userId,
            userName: req.session.name,
            userEmail: req.session.email,
            eventId: eventId,
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventVenue: event.venue,
            registeredAt: new Date().toISOString()
        };

        // Generate QR code
        const qrCodeDataUrl = await generateQRCode(qrData);

        // Create registration
        const registration = new Registration({
            user: userId,
            event: eventId,
            qrCode: qrCodeDataUrl
        });

        await registration.save();

        // Update event
        event.registeredStudents.push(userId);
        await event.save();

        // Update user
        await User.findByIdAndUpdate(userId, {
            $push: { registeredEvents: eventId }
        });

        // Send confirmation email with QR code
        try {
            await sendEventRegistrationEmail(
                req.session.email,
                req.session.name,
                event.title,
                qrCodeDataUrl
            );
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue even if email fails
        }

        await registration.populate([
            { path: 'user', select: 'name email' },
            { path: 'event', select: 'title date time venue' }
        ]);

        res.status(201).json({
            message: 'Registration successful',
            registration
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Check if user is registered for an event (Must come before /:id to avoid route conflict)
router.get('/check/:eventId', isAuthenticated, async (req, res) => {
    try {
        const registration = await Registration.findOne({
            user: req.session.userId,
            event: req.params.eventId
        });

        res.json({ isRegistered: !!registration, registration });
    } catch (error) {
        console.error('Error checking registration:', error);
        res.status(500).json({ error: 'Failed to check registration' });
    }
});

// Get user's registrations
router.get('/my-registrations', isAuthenticated, async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.session.userId })
            .populate('event')
            .sort({ registrationDate: -1 });

        res.json(registrations);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

// Get single registration
router.get('/:id', isAuthenticated, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id)
            .populate('user', 'name email')
            .populate('event');

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Check if user owns this registration
        if (registration.user._id.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.json(registration);
    } catch (error) {
        console.error('Error fetching registration:', error);
        res.status(500).json({ error: 'Failed to fetch registration' });
    }
});

// Cancel registration
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found' });
        }

        // Check if user owns this registration
        if (registration.user.toString() !== req.session.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Remove from event
        await Event.findByIdAndUpdate(registration.event, {
            $pull: { registeredStudents: req.session.userId }
        });

        // Remove from user
        await User.findByIdAndUpdate(req.session.userId, {
            $pull: { registeredEvents: registration.event }
        });

        await Registration.findByIdAndDelete(req.params.id);

        res.json({ message: 'Registration cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling registration:', error);
        res.status(500).json({ error: 'Failed to cancel registration' });
    }
});

module.exports = router;