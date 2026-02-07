const router = require('express').Router();
const { getAllBins, getUserBins, createBin, updateBinStatus } = require('../controllers/binController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAllBins);
router.get('/my', protect, getUserBins);
router.post('/', protect, createBin);
router.patch('/:id/status', protect, updateBinStatus);

module.exports = router;
