const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    imagePublicId: {
        type: String
    },
    organiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registeredStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    maxCapacity: {
        type: Number,
        default: 200
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);