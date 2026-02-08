const express = require('express');
const router = express.Router();
const { getLeaderboard } = require('../controllers/userController');

// Public route - get leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
