const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const testConfig = require('../testConfig');

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

describe('User Model', () => {
    it('should create a user successfully', async () => {
        const userData = { name: testConfig.user.name, email: testConfig.user.email };
        const user = await User.create(userData);
        expect(user._id).toBeDefined();
        expect(user.name).toBe(userData.name);
        expect(user.email).toBe(userData.email);
        expect(user.verified).toBe(false); // Default value
    });

    it('should fail if email is missing', async () => {
        const userData = { name: 'Test User' };
        await expect(User.create(userData)).rejects.toThrow();
    });

    it('should fail if duplicate email is used', async () => {
        const userData = { name: 'Test User', email: 'duplicate@example.com' };
        await User.create(userData);
        await expect(User.create(userData)).rejects.toThrow();
    });
});
