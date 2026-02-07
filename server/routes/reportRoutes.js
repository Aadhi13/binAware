const router = require('express').Router();
const { createReport, getAllReports, getUserReports } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllReports);
router.get('/my', protect, getUserReports);
router.post('/', protect, createReport);

module.exports = router;
