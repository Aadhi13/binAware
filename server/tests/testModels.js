const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');
const Otp = require('../models/Otp');

async function testModels() {
    try {
        // Connect to MongoDB
        const uri = process.env.ATLAS_URI;
        if (!uri) {
            console.error("ATLAS_URI is not set in .env");
            return;
        }

        // Just check if models are loaded correctly by creating valid objects
        // We won't save them to avoid polluting the DB if user used a real URI

        const user = new User({
            name: "Test User",
            email: "test@example.com"
        });

        await user.validate();
        console.log("User model validation successful");

        const otp = new Otp({
            user: new mongoose.Types.ObjectId(),
            email: "test@example.com",
            otpHash: "somehash",
            expiresAt: new Date()
        });

        await otp.validate();
        console.log("Otp model validation successful");

        console.log("All verifications passed!");

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        process.exit(0);
    }
}

testModels();
