const { generateOTP, hashOTP, verifyOTP } = require('../../utils/otp');
const bcrypt = require('bcryptjs');

describe('OTP Utils', () => {
    describe('generateOTP', () => {
        it('should generate a 6-digit OTP', () => {
            const otp = generateOTP();
            expect(otp).toHaveLength(6);
            expect(otp).toMatch(/^\d{6}$/);
        });

        it('should generate different OTPs on subsequent calls', () => {
            const otp1 = generateOTP();
            const otp2 = generateOTP();
            expect(otp1).not.toBe(otp2);
        });
    });

    describe('hashOTP & verifyOTP', () => {
        it('should verify a correct OTP', async () => {
            const otp = '123456';
            const hash = await hashOTP(otp);
            const isValid = await verifyOTP(otp, hash);
            expect(isValid).toBe(true);
        });

        it('should reject an incorrect OTP', async () => {
            const otp = '123456';
            const hash = await hashOTP(otp);
            const isValid = await verifyOTP('654321', hash);
            expect(isValid).toBe(false);
        });
    });
});
