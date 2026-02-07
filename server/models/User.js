const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
