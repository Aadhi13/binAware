const Report = require('../models/Report');
const User = require('../models/User');

const { checkBadges } = require('../utils/badgeService');

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

        // Increment user points (+10 per report)
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { points: 10 }
        });

        // Check for new badges
        const newBadges = await checkBadges(req.user._id);
        const responseReport = report.toObject();
        if (newBadges && newBadges.length > 0) {
            responseReport.newBadges = newBadges;
        }

        res.status(201).json(responseReport);
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ message: 'Server error while creating report' });
    }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Server error while fetching reports' });
    }
};

// @desc    Get current user's reports
// @route   GET /api/reports/my
// @access  Private
const getUserReports = async (req, res) => {
    try {
        const reports = await Report.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({ message: 'Server error while fetching reports' });
    }
};

// @desc    Toggle upvote on a report
// @route   PATCH /api/reports/:id/upvote
// @access  Private
const toggleUpvote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const report = await Report.findById(id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const isUpvoted = report.upvotes.includes(userId);

        if (isUpvoted) {
            // Remove upvote
            report.upvotes.pull(userId);
        } else {
            // Add upvote
            report.upvotes.addToSet(userId);
        }

        await report.save();

        res.json(report);
    } catch (error) {
        console.error('Toggle upvote error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createReport,
    getAllReports,
    getUserReports,
    toggleUpvote,
};
