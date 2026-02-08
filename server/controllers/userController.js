const User = require('../models/User');

// @desc    Get leaderboard (top 10 users by points)
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const topUsers = await User.find()
            .select('name points')
            .sort({ points: -1 })
            .limit(10);

        res.json(topUsers);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Server error while fetching leaderboard' });
    }
};

module.exports = {
    getLeaderboard,
};
