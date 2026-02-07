const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRouter = require('../../routes/authRoutes');
const User = require('../../models/User');
const Otp = require('../../models/Otp');
const testConfig = require('../testConfig');

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
});
