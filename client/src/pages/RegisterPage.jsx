import { useState } from 'react';
import PropTypes from 'prop-types';
import Header from '../components/Header';
import Message from '../components/Message';

function RegisterPage({ onNavigate, onSubmit }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await onSubmit({ name, email });
            if (result.success) {
                // HACK: for hackathon
                const msg = result.otp
                    ? `OTP: ${result.otp} (Hackathon Mode)`
                    : result.message;
                setMessage({ type: 'success', text: msg });

                // Navigate to OTP verification after short delay
                setTimeout(() => {
                    onNavigate('verify-otp', { email, flow: 'register' });
                }, result.otp ? 5000 : 1500);
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
                    title="Create Account"
                    subtitle="Join our community of civic reporters"
                />

                {message.text && (
                    <div className="mb-6">
                        <Message type={message.type}>{message.text}</Message>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-slate-700 mb-2"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="Enter your name"
                            required
                            disabled={loading}
                        />
                    </div>

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
                        {loading ? 'Sending OTP...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-civic-600 hover:text-civic-700 font-medium"
                            type="button"
                        >
                            Login instead
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

RegisterPage.propTypes = {
    onNavigate: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default RegisterPage;
