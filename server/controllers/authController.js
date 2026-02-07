const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateOTP, hashOTP } = require('../utils/otp');
const { sendVerificationMail } = require('../utils/mail');

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
        const otpHash = hashOTP(otp);

        // Create OTP record
        // Expires in 10 minutes
        await Otp.create({
            user: user._id,
            email,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // Send Email
        await sendVerificationMail(email, otp);

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
    res.send("Login Endpoint");
};

module.exports = {
    register,
    login
};
