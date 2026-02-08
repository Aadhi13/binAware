const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    lat: {
        type: Number,
        required: true,
    },
    lng: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['overflow', 'missing-bin', 'misused-bin', 'littered-area'],
    },
    comment: {
        type: String,
        trim: true,
    },
    photoUrl: {
        type: String,
        trim: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
