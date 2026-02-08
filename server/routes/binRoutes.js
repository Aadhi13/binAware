const router = require('express').Router();
const { getAllBins, getUserBins, createBin, updateBinStatus } = require('../controllers/binController');
const { protect } = require('../middleware/authMiddleware');

console.log("inside authRoutes.js");

router.get('/', getAllBins);
router.get('/my', protect, getUserBins);
router.post('/', protect, createBin);
router.patch('/:id/status', protect, updateBinStatus);

module.exports = router;
