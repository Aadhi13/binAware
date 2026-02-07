const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
    lat: {
        type: Number,
        required: true,
    },
    lng: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['good', 'overflow', 'missing', 'misused'],
        default: 'good',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Bin = mongoose.model('Bin', binSchema);

module.exports = Bin;
