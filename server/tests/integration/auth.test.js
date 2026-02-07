const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRouter = require('../../routes/authRoutes');
const User = require('../../models/User');
const Otp = require('../../models/Otp');
const testConfig = require('../testConfig');
const { hashOTP, verifyOTP } = require('../../utils/otp');

// Conditional mocking: Only mock if real mail is NOT enabled
if (!testConfig.enableRealMail) {
    jest.mock('../../utils/mail', () => ({
        verificationMail: jest.fn(),
        welcomeMail: jest.fn()
    }));
}

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear collections between tests
    await User.deleteMany({});
    await Otp.deleteMany({});
    jest.clearAllMocks();
});

describe('Auth Integration Tests', () => {
    describe('POST /api/auth/register', () => {
        it('should register a new user and send OTP', async () => {
            const userData = { name: testConfig.user.name, email: testConfig.user.email };
            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('OTP sent successfully');
            expect(res.body.verified).toBe(false);

            // Verify DB state
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.verified).toBe(false);

            const otp = await Otp.findOne({ email: userData.email });
            expect(otp).toBeTruthy();
        });

        it('should handle existing verified user', async () => {
            // Setup existing verified user
            await User.create({ name: 'Verified', email: 'verified@example.com', verified: true });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Verified', email: 'verified@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User already exists');
            expect(res.body.redirect).toBe('/login');
        });

        it('should resend OTP for existing unverified user', async () => {
            // Setup existing unverified user
            await User.create({ name: 'Unverified', email: 'unverified@example.com', verified: false });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Unverified', email: 'unverified@example.com' });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('OTP sent successfully');

            // Verify new OTP was created
            const otp = await Otp.findOne({ email: 'unverified@example.com' });
            expect(otp).toBeTruthy();
        });

        it('should return 400 for invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Invalid', email: 'not-an-email' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid email format');
        });
    });

    describe('POST /api/auth/verify-otp', () => {
        it('should verify user with correct OTP and return token', async () => {
            // Setup
            const userData = { name: 'Verify User', email: 'verify@example.com' };
            const user = await User.create({ ...userData, verified: false });
            const otp = '123456';
            const otpHash = await hashOTP(otp);
            await Otp.create({
                user: user._id,
                email: userData.email,
                otpHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: userData.email, otp });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('OTP is correct, email is verified.');
            expect(res.body.token).toBeDefined(); // Check for token
            expect(res.body.user).toBeDefined();
            expect(res.body.user.email).toBe(userData.email);

            // Verify user is updated
            const updatedUser = await User.findById(user._id);
            expect(updatedUser.verified).toBe(true);

            // Verify OTP is marked used
            const updatedOtp = await Otp.findOne({ email: userData.email });
            expect(updatedOtp.used).toBe(true);
        });

        it('should reject incorrect OTP', async () => {
            // Setup
            const userData = { name: 'Verify User 2', email: 'verify2@example.com' };
            const user = await User.create({ ...userData, verified: false });
            const otpHash = await hashOTP('123456');
            await Otp.create({
                user: user._id,
                email: userData.email,
                otpHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            });

            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: userData.email, otp: '654321' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('OTP is not correct.');
        });

        it('should reject expired OTP', async () => {
            // Setup
            const userData = { name: 'Expired User', email: 'expired@example.com' };
            const user = await User.create({ ...userData, verified: false });
            const otp = '123456';
            const otpHash = await hashOTP(otp);
            await Otp.create({
                user: user._id,
                email: userData.email,
                otpHash,
                expiresAt: new Date(Date.now() - 1000) // Expired
            });

            const res = await request(app)
                .post('/api/auth/verify-otp')
                .send({ email: userData.email, otp });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('No active OTP found');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should send OTP for existing user', async () => {
            const userData = { name: 'Login User', email: 'login@example.com' };
            await User.create(userData);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: userData.email });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('OTP sent');

            const otp = await Otp.findOne({ email: userData.email });
            expect(otp).toBeTruthy();
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'unknown@example.com' });

            expect(res.status).toBe(404);
            expect(res.body.message).toContain('User not found');
        });
    });

    describe('POST /api/auth/resend-otp', () => {
        it('should resend OTP for unverified user', async () => {
            const userData = { name: 'Resend User', email: 'resend@example.com' };
            await User.create({ ...userData, verified: false });

            const res = await request(app)
                .post('/api/auth/resend-otp')
                .send({ email: userData.email });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('OTP resent successfully');

            const otp = await Otp.findOne({ email: userData.email });
            expect(otp).toBeTruthy();
        });

        it('should not resend for unknown user', async () => {
            const res = await request(app)
                .post('/api/auth/resend-otp')
                .send({ email: 'unknown@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('User not found');
        });
    });
});
