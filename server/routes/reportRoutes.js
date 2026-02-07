const router = require('express').Router();
const { createReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReport);

module.exports = router;
