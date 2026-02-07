const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function generateOtpFallback() {
    let otp = "";
    while (otp.length < 6) {
        const randomBits = Math.floor(Math.random() * 1000000); // Generate random number between 0 and 999999
        otp = randomBits.toString().padStart(6, "0"); // Ensure 6 digits
    }
    return otp;
}

// Generate a true random OTP using crypto if available, else fallback
const generateOTP = () => {
    try {
        // Use Node.js crypto which is safer and available
        return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    } catch (error) {
        // Fallback or use user provided logic if randomInt fails (unlikely in modern Node)
        return generateOtpFallback();
    }
};

const hashOTP = (plain) => {
    return bcrypt.hash(plain, 10);
};

const verifyOTP = (plain, hash) => {
    return bcrypt.compare(plain, hash);
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP
};
