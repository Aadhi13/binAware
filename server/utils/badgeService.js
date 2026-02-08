/**
 * Badge Service
 * Handles checking and awarding badges based on user activity.
 */

const User = require('../models/User');
const Report = require('../models/Report');
const Bin = require('../models/Bin');

const BADGES = {
    FIRST_STEP: {
        id: 'first-step',
        name: 'First Step',
        icon: '🌱',
        description: 'Made your first contribution'
    },
    BIN_GUARDIAN: {
        id: 'bin-guardian',
        name: 'Bin Guardian',
        icon: '🛡️',
        description: 'Reported 5 issues'
    },
    TOP_REPORTER: {
        id: 'top-reporter',
        name: 'Top Reporter',
        icon: '🏆',
        description: 'Reported 10 issues'
    },
    SCOUT: {
        id: 'scout',
        name: 'Scout',
        icon: '🔭',
        description: 'Added 5 new bins'
    },
    VETERAN: {
        id: 'veteran',
        name: 'Veteran',
        icon: '⭐',
        description: 'Earned 100+ points'
    }
};

/**
 * Check if user is eligible for any new badges
 * @param {string} userId 
 */
const checkBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const reportCount = await Report.countDocuments({ user: userId });
        const binCount = await Bin.countDocuments({ createdBy: userId });
        const totalContributions = reportCount + binCount;

        const newBadges = [];

        // Helper to check if user already has badge
        const hasBadge = (badgeId) => user.badges.some(b => b.id === badgeId);

        // 1. First Step (1st contribution)
        if (totalContributions >= 1 && !hasBadge(BADGES.FIRST_STEP.id)) {
            newBadges.push(BADGES.FIRST_STEP);
        }

        // 2. Bin Guardian (5 Reports)
        if (reportCount >= 5 && !hasBadge(BADGES.BIN_GUARDIAN.id)) {
            newBadges.push(BADGES.BIN_GUARDIAN);
        }

        // 3. Top Reporter (10 Reports)
        if (reportCount >= 10 && !hasBadge(BADGES.TOP_REPORTER.id)) {
            newBadges.push(BADGES.TOP_REPORTER);
        }

        // 4. Scout (5 Bins)
        if (binCount >= 5 && !hasBadge(BADGES.SCOUT.id)) {
            newBadges.push(BADGES.SCOUT);
        }

        // 5. Veteran (100 Points)
        if (user.points >= 100 && !hasBadge(BADGES.VETERAN.id)) {
            newBadges.push(BADGES.VETERAN);
        }

        // Save new badges if any
        if (newBadges.length > 0) {
            user.badges.push(...newBadges);
            await user.save();
            console.log(`🏅 Awarded ${newBadges.length} new badges to user ${user.name}`);
        }

        return newBadges;

    } catch (error) {
        console.error('Error checks badges:', error);
    }
};

module.exports = {
    checkBadges,
    BADGES
};
