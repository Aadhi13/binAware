const nodemailer = require('nodemailer');

// 1. Mock nodemailer module
jest.mock('nodemailer');

// 2. Define the mock function we want to spy on
const mockSendMail = jest.fn().mockResolvedValue(true);

// 3. Configure the mock BEFORE importing the module that uses it
nodemailer.createTransport.mockReturnValue({
    sendMail: mockSendMail
});

// 4. Import the module under test
// This triggers createTransport to be called, which now returns our mock object
const { verificationMail, welcomeMail } = require('../../utils/mail');
const testConfig = require('../testConfig');

describe('Mail Utils', () => {
    beforeEach(() => {
        // Clear mock history before each test
        mockSendMail.mockClear();
    });

    it('should send verification email with correct parameters', async () => {
        const name = testConfig.user.name;
        const email = testConfig.user.email;
        const otp = '123456';

        await verificationMail(name, email, otp);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const mailOptions = mockSendMail.mock.calls[0][0];
        expect(mailOptions.to).toBe(email);
        expect(mailOptions.subject).toContain('Verification OTP for binAware');
        expect(mailOptions.html).toContain(name);
        expect(mailOptions.html).toContain(otp);
        expect(mailOptions.html).toContain('binAware');
    });

    it('should send welcome email with correct parameters', async () => {
        const name = testConfig.user.name;
        const email = testConfig.user.email;

        await welcomeMail(name, email);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        const mailOptions = mockSendMail.mock.calls[0][0];
        expect(mailOptions.to).toBe(email);
        expect(mailOptions.subject).toContain('Welcome to binAware');
        expect(mailOptions.html).toContain(name);
        expect(mailOptions.html).toContain('binAware');
    });
});
