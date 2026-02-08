import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';

const typeLabels = {
    'overflow': 'Overflowing Bin',
    'missing-bin': 'Missing Bin',
    'misused-bin': 'Misused Bin',
    'littered-area': 'Littered Area',
};

function ProfilePage() {
    const navigate = useNavigate();
    const { user: authUser, token, logout } = useAuth();

    const [user, setUser] = useState(null);
    const [reports, setReports] = useState([]);
    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, reportsRes, binsRes] = await Promise.all([
                    fetch(`${API_BASE}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/reports/my`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch(`${API_BASE}/bins/my`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (!userRes.ok) throw new Error('Failed to fetch user data');

                const userData = await userRes.json();
                setUser(userData);

                if (reportsRes.ok) {
                    setReports(await reportsRes.json());
                }

                if (binsRes.ok) {
                    setBins(await binsRes.json());
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
        else setLoading(false);
    }, [token, API_BASE]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-600"></div>
            </div>
        );
    }

    const displayUser = user || authUser;
    const recentReports = reports.slice(0, 3); // Last 3 reports

    return (
        <div className="min-h-[calc(100dvh-4rem)] p-5 pb-20">
            <Header title="Profile" subtitle="Your account details" />

            {error && (
                <div className="mb-4 max-w-sm mx-auto">
                    <Message type="error">{error}</Message>
                </div>
            )}

            {/* Content wrapper */}
            <div className="max-w-sm mx-auto">
                {/* Avatar */}
                <div className="flex justify-center my-5">
                    <div className="w-16 h-16 rounded-full bg-civic-100 flex items-center justify-center">
                        <span className="text-2xl font-bold text-civic-600">
                            {displayUser?.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Name</p>
                            <p className="text-base font-semibold text-slate-800">{displayUser?.name || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</p>
                            <p className="text-sm text-slate-600">{displayUser?.email || 'Unknown'}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</p>
                                <span className={`inline-flex items-center text-sm font-medium ${displayUser?.verified ? 'text-green-600' : 'text-amber-600'}`}>
                                    {displayUser?.verified ? (
                                        <>
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Verified
                                        </>
                                    ) : 'Pending'}
                                </span>
                            </div>
                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Points */}
                    <div className="bg-gradient-to-br from-civic-500 to-civic-600 rounded-xl p-4 text-white col-span-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-civic-100 text-xs font-medium">Total Points</p>
                                <p className="text-3xl font-bold mt-1">{displayUser?.points || 0}</p>
                            </div>
                            <div className="bg-white/20 rounded-full p-3">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Reports */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Reports</p>
                        <p className="text-2xl font-bold text-slate-800">{reports.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Submitted</p>
                    </div>

                    {/* Bins */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Bins</p>
                        <p className="text-2xl font-bold text-slate-800">{bins.length}</p>
                        <p className="text-xs text-slate-500 mt-1">Added</p>
                    </div>

                    {/* Rank - placeholder for now */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Rank</p>
                        <p className="text-2xl font-bold text-slate-800">-</p>
                        <p className="text-xs text-slate-500 mt-1">Leaderboard</p>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Badges & Achievements</p>

                    {displayUser?.badges && displayUser.badges.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {displayUser.badges.map((badge, index) => (
                                <div key={index} className="flex flex-col items-center text-center p-2 rounded-lg bg-slate-50 border border-slate-100" title={badge.description}>
                                    <span className="text-2xl mb-1">{badge.icon}</span>
                                    <span className="text-xs font-medium text-slate-700 leading-tight">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            <span className="text-2xl block mb-2">🌱</span>
                            <p className="text-sm font-medium text-slate-600">No badges yet</p>
                            <p className="text-xs text-slate-400">Start contributing to earn them!</p>
                        </div>
                    )}
                </div>

                {/* Leaderboard Button */}
                <button
                    onClick={() => navigate('/dashboard/leaderboard')}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-4 mb-4 flex items-center justify-between hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 rounded-full p-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="font-semibold">View Leaderboard</p>
                            <p className="text-xs text-white/80">See how you rank!</p>
                        </div>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Recent Activity */}
                {recentReports.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-700">Recent Activity</h3>
                            <span className="text-xs text-slate-400">Last 3 reports</span>
                        </div>
                        <div className="space-y-2">
                            {recentReports.map((report) => (
                                <div key={report._id} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                                    <div className="flex-shrink-0 w-8 h-8 bg-civic-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-civic-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {typeLabels[report.type] || report.type}
                                        </p>
                                        <p className="text-xs text-slate-400">{formatDate(report.createdAt)}</p>
                                    </div>
                                    <span className="text-xs font-semibold text-green-600">+10</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No activity message */}
                {recentReports.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-500">No reports yet</p>
                        <p className="text-xs text-slate-400 mt-1">Start reporting issues to earn points!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
