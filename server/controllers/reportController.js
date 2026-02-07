const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
    try {
        const { lat, lng, type, comment, photoUrl } = req.body;

        // Basic validation
        if (!lat || !lng || !type) {
            return res.status(400).json({ message: 'Please provide location and report type' });
        }

        // Validate type enum
        const validTypes = ['overflow', 'missing-bin', 'misused-bin', 'littered-area'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid report type' });
        }

        // Create report
        const report = await Report.create({
            lat,
            lng,
            type,
            comment,
            photoUrl,
            user: req.user._id,
        });

        // Increment user points
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { points: 1 }
        });

        res.status(201).json(report);
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ message: 'Server error while creating report' });
    }
};

module.exports = {
    createReport,
};
