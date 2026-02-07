const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateOTP, hashOTP, verifyOTP } = require('../utils/otp');
const { verificationMail } = require('../utils/mail');
const { createToken } = require('../utils/auth');

const register = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Basic Regex for email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.verified) {
                return res.status(200).json({
                    message: "User already exists",
                    redirect: "/login",
                    userExists: true,
                    verified: true
                });
            }
            // User exists but not verified - continues to generate OTP
        } else {
            // Create new user (verified: false by default)
            user = await User.create({
                name,
                email
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);

        // Create OTP record
        // Expires in 10 minutes
        await Otp.create({
            user: user._id,
            email,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // Send Email
        await verificationMail(user.name, email, otp);

        res.status(201).json({
            message: "OTP sent successfully",
            userId: user._id,
            verified: false
        });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const login = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found. Please register first." });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);

        // Create OTP record (expires in 10 mins)
        await Otp.create({
            user: user._id,
            email,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // Send Email
        try {
            await verificationMail(user.name, user.email, otp);
        } catch (mailErr) {
            console.error("Error sending login OTP email:", mailErr);
            return res.status(500).json({ message: "Error sending OTP" });
        }

        return res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { otp, email } = req.body;

        if (!otp || !email) {
            return res.status(400).json({ message: "OTP and email are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }


        // find ALL active OTPs (unexpired + unused) for this user/email
        const now = new Date();
        const otpDocs = await Otp.find({
            email,
            user: user._id,
            used: false,
            expiresAt: { $gt: now },
        }).sort({ createdAt: -1 });

        if (!otpDocs.length) {
            return res.status(400).json({
                message: "No active OTP found for this email. Try resending OTP.",
            });
        }

        // try match against ANY active OTP
        let matchedDoc = null;
        for (const doc of otpDocs) {
            const ok = await verifyOTP(otp, doc.otpHash);
            if (ok) {
                matchedDoc = doc;
                break;
            }
        }

        if (!matchedDoc) {
            console.log("No matching OTP found for:", otp);
            return res.status(401).json({ message: "OTP is not correct." });
        }

        // mark user verified
        user.verified = true;
        await user.save();

        // mark ONLY the matched OTP as used
        matchedDoc.used = true;
        await matchedDoc.save();

        // TODO: Send verification successful email? 
        // For now, just return success.

        // Generate JWT token
        const token = createToken(user._id);

        return res.status(200).json({
            message: "OTP is correct, email is verified.",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verified: user.verified
            }
        });

    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

const resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        console.log("resend email from server: ", email);
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "User not found. Register first then request OTP to verify.",
            });
        }

        // Generate otp
        const otp = generateOTP();
        const otpHash = await hashOTP(otp);

        // Create OTP record in DB
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await Otp.create({
            user: user._id,
            email,
            otpHash,
            expiresAt,
        });

        // Send email
        try {
            await verificationMail(user.name, user.email, otp);
        } catch (mailErr) {
            console.error("Error sending verification email", mailErr);
            return res.status(500).json({ message: "Error sending email" });
        }

        return res.status(201).json({
            message: "OTP resent successfully",
            expiresAt,
        });

    } catch (err) {
        console.error("Resend OTP Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    verifyOtp,
    resendOtp,
    getMe
};
