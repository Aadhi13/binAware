const jwt = require('jsonwebtoken');

const createToken = (userId) => {
    // Fallback secret for development/testing if not set
    const secret = process.env.JWT_SECRET || 'dev_secret_key_123';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign({ userId }, secret, {
        expiresIn
    });
};

module.exports = {
    createToken
};
