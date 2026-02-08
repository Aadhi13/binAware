import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VerifyOTPPage from './pages/VerifyOTPPage';

// Dashboard
import DashboardLayout from './layouts/DashboardLayout';
import MapPage from './pages/MapPage';
import AddReportPage from './pages/AddReportPage';
import AddBinPage from './pages/AddBinPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth pages wrapper with internal navigation
function AuthPages() {
  const { isAuthenticated, loading, login } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState({});

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-600"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard/map" replace />;
  }

  const navigateTo = (page, data = {}) => {
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
        login(data.user, data.token);
        // Navigate to dashboard after successful verification
        navigate('/dashboard/map');
        return { success: true, message: 'Verified successfully!' };
      }
      return { success: false, message: data.message || 'Verification failed' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleResendOTP = async ({ email }) => {
    try {
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

  switch (currentPage) {
    case 'home':
      return <HomePage onNavigate={navigateTo} />;
    case 'register':
      return <RegisterPage onNavigate={navigateTo} onSubmit={handleRegister} />;
    case 'login':
      return <LoginPage onNavigate={navigateTo} onSubmit={handleLogin} />;
    case 'verify-otp':
      return (
        <VerifyOTPPage
          email={pageData.email || ''}
          flow={pageData.flow || 'login'}
          onNavigate={navigateTo}
          onSubmit={handleVerifyOTP}
          onResend={handleResendOTP}
        />
      );
    default:
      return <HomePage onNavigate={navigateTo} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<AuthPages />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/map" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="add" element={<AddReportPage />} />
            <Route path="add-bin" element={<AddBinPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;