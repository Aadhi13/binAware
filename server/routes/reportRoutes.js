const router = require('express').Router();
const { createReport, getAllReports, getUserReports, toggleUpvote } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllReports);
router.get('/my', protect, getUserReports);
router.post('/', protect, createReport);
router.patch('/:id/upvote', protect, toggleUpvote);

module.exports = router;
