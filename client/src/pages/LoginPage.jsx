import { useState } from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import Message from '../components/Message';

function LoginPage({ onNavigate, onSubmit }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await onSubmit({ email });
            if (result.success) {
                // HACK: for hackathon
                const msg = result.otp
                    ? `OTP: ${result.otp} (Hackathon Mode)`
                    : result.message;
                setMessage({ type: 'success', text: msg });

                // Navigate to OTP verification after short delay
                setTimeout(() => {
                    onNavigate('verify-otp', { email, flow: 'login' });
                }, result.otp ? 5000 : 1500); // Give more time to read OTP
            } else {
                setMessage({ type: 'error', text: result.message });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="card">
                <Header
                    title="Welcome Back"
                    subtitle="Enter your email to receive a login code"
                />

                {message.text && (
                    <div className="mb-6">
                        <Message type={message.type}>{message.text}</Message>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-slate-700 mb-2"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="you@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <button
                            onClick={() => onNavigate('register')}
                            className="text-civic-600 hover:text-civic-700 font-medium"
                            type="button"
                        >
                            Create one
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

LoginPage.propTypes = {
    onNavigate: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default LoginPage;
