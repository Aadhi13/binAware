const router = require('express').Router();
const { register, login, verifyOtp, resendOtp, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

console.log("inside authRoutes.js");

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);

module.exports = router;
