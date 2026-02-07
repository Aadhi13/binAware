require('dotenv').config();

const testConfig = {
    user: {
        name: process.env.TEST_NAME || 'Test User',
        email: process.env.TEST_EMAIL || 'test@example.com'
    },
    enableRealMail: process.env.TEST_REAL_MAIL === 'true'
};

module.exports = testConfig;
