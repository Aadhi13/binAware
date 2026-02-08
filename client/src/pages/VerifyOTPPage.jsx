import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import Message from '../components/Message';

function VerifyOTPPage({ email, flow, onNavigate, onSubmit, onResend }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const inputRefs = useRef([]);

    // Focus first input on mount
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split('').forEach((char, i) => {
            if (i < 6) newOtp[i] = char;
        });
        setOtp(newOtp);

        // Focus last filled input or the last one
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');

        if (otpString.length !== 6) {
            setMessage({ type: 'error', text: 'Please enter all 6 digits' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await onSubmit({ email, otp: otpString });
            if (result.success) {
                setMessage({ type: 'success', text: result.message || 'Verified successfully!' });
                // Navigate to dashboard or home after success
                setTimeout(() => {
                    onNavigate('home');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await onResend({ email });
            if (result.success) {
                setMessage({ type: 'success', text: 'OTP resent successfully!' });
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to resend OTP' });
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="page-container">
            <div className="card">
                <Header
                    title="Verify OTP"
                    subtitle={`Enter the 6-digit code sent to ${email}`}
                />

                {message.text && (
                    <div className="mb-6">
                        <Message type={message.type}>{message.text}</Message>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-xl font-semibold border-2 border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-civic-500 focus:border-transparent
                         transition-all duration-200"
                                disabled={loading}
                                aria-label={`Digit ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading || otp.join('').length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-slate-500">
                        Didn&apos;t receive the code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-civic-600 hover:text-civic-700 font-medium disabled:opacity-50"
                            type="button"
                        >
                            {resending ? 'Resending...' : 'Resend OTP'}
                        </button>
                    </p>

                    <button
                        onClick={() => onNavigate(flow === 'register' ? 'register' : 'login')}
                        className="text-sm text-slate-400 hover:text-slate-600"
                        type="button"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        </div>
    );
}

VerifyOTPPage.propTypes = {
    email: PropTypes.string.isRequired,
    flow: PropTypes.oneOf(['register', 'login']).isRequired,
    onNavigate: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onResend: PropTypes.func.isRequired,
};

export default VerifyOTPPage;
