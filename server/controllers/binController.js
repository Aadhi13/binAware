const Bin = require('../models/Bin');
const User = require('../models/User');

// Get all bins (public)
const getAllBins = async (req, res) => {
    try {
        const bins = await Bin.find().sort({ createdAt: -1 });
        res.json(bins);
    } catch (error) {
        console.error('Get bins error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's bins (protected)
const getUserBins = async (req, res) => {
    try {
        const bins = await Bin.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
        res.json(bins);
    } catch (error) {
        console.error('Get user bins error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new bin (protected)
const createBin = async (req, res) => {
    try {
        const { lat, lng, status } = req.body;

        if (!lat || !lng) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const bin = await Bin.create({
            lat,
            lng,
            status: status || 'good',
            createdBy: req.user._id,
        });

        // Award points to user for adding a bin (+5 per bin)
        await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });

        res.status(201).json(bin);
    } catch (error) {
        console.error('Create bin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update bin status (protected)
const updateBinStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['good', 'overflow', 'missing', 'misused'].includes(status)) {
            return res.status(400).json({ message: 'Valid status is required' });
        }

        const bin = await Bin.findByIdAndUpdate(
            id,
            { status, lastUpdated: Date.now() },
            { new: true }
        );

        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }

        res.json(bin);
    } catch (error) {
        console.error('Update bin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllBins,
    getUserBins,
    createBin,
    updateBinStatus,
};
