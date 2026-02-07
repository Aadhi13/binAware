import { useState } from 'react';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VerifyOTPPage from './pages/VerifyOTPPage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState({});

  const navigate = (page, data = {}) => {
    setCurrentPage(page);
    setPageData(data);
  };

  // API handlers
  const handleRegister = async ({ name, email }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true, message: data.message || 'OTP sent to your email!' };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleLogin = async ({ email }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true, message: data.message || 'OTP sent to your email!' };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleVerifyOTP = async ({ email, otp }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        // Store token for future requests
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, message: 'Verified successfully!' };
      }
      return { success: false, message: data.message || 'Verification failed' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleResendOTP = async ({ email }) => {
    try {
      console.log('resendotp email: ', email);

      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        return { success: true, message: 'OTP resent successfully!' };
      }
      return { success: false, message: data.message || 'Failed to resend OTP' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} onSubmit={handleRegister} />;
      case 'login':
        return <LoginPage onNavigate={navigate} onSubmit={handleLogin} />;
      case 'verify-otp':
        return (
          <VerifyOTPPage
            email={pageData.email || ''}
            flow={pageData.flow || 'login'}
            onNavigate={navigate}
            onSubmit={handleVerifyOTP}
            onResend={handleResendOTP}
          />
        );
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return renderPage();
}

export default App;