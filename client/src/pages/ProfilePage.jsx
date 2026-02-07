import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Placeholder points (would come from backend)
    const gamificationPoints = 150;

    return (
        <div className="p-6 max-w-md mx-auto">
            <Header title="Profile" subtitle="Your account details" />

            {/* Avatar */}
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-civic-100 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-civic-600">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-100">
                    <label className="text-xs text-slate-400 uppercase tracking-wide">Name</label>
                    <p className="text-lg font-medium text-slate-800 mt-1">
                        {user?.name || 'User'}
                    </p>
                </div>

                <div className="p-4 border-b border-slate-100">
                    <label className="text-xs text-slate-400 uppercase tracking-wide">Email</label>
                    <p className="text-lg font-medium text-slate-800 mt-1">
                        {user?.email || 'user@example.com'}
                    </p>
                </div>

                <div className="p-4">
                    <label className="text-xs text-slate-400 uppercase tracking-wide">Verification Status</label>
                    <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                        </span>
                    </div>
                </div>
            </div>

            {/* Gamification Points */}
            <div className="bg-gradient-to-r from-civic-500 to-civic-600 rounded-xl p-5 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-civic-100 text-sm">Your Points</p>
                        <p className="text-3xl font-bold">{gamificationPoints}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                </div>
                <p className="text-civic-100 text-xs mt-3">
                    Keep reporting to earn more points!
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">12</p>
                    <p className="text-xs text-slate-500">Reports Submitted</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
                    <p className="text-2xl font-bold text-slate-800">8</p>
                    <p className="text-xs text-slate-500">Issues Resolved</p>
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-50 border border-red-200 text-red-600 font-medium rounded-lg
                   hover:bg-red-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                Logout
            </button>
        </div>
    );
}

export default ProfilePage;
