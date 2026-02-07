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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAllReports, setShowAllReports] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch(`${API_BASE}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!userRes.ok) throw new Error('Failed to fetch user data');

                const userData = await userRes.json();
                setUser(userData);

                const reportsRes = await fetch(`${API_BASE}/reports/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (reportsRes.ok) {
                    setReports(await reportsRes.json());
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
    const visibleReports = showAllReports ? reports : reports.slice(0, 2);

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

                {/* Points Card */}
                <div className="bg-gradient-to-r from-civic-500 to-civic-600 rounded-xl p-4 mb-4 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <p className="text-civic-100 text-xs font-medium">Your Points</p>
                    <p className="text-3xl font-bold">{user?.points ?? displayUser?.points ?? 0}</p>
                    <p className="text-civic-200 text-xs mt-1">Keep reporting to earn more!</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-xl font-bold text-slate-800">{reports.length}</p>
                        <p className="text-xs text-slate-500">Reports</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                        <p className="text-xl font-bold text-slate-800">
                            {reports.filter(r => r.type === 'overflow').length}
                        </p>
                        <p className="text-xs text-slate-500">Resolved</p>
                    </div>
                </div>

                {/* Recent Reports - always show a preview */}
                {reports.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Recent Reports</h3>
                        <div className="space-y-2">
                            {visibleReports.map((report) => (
                                <div key={report._id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${report.type === 'overflow' ? 'bg-red-500' :
                                        report.type === 'missing-bin' ? 'bg-gray-800' :
                                            report.type === 'misused-bin' ? 'bg-yellow-500' :
                                                'bg-blue-500'
                                        }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700">
                                            {typeLabels[report.type] || report.type}
                                        </p>
                                        {report.comment && (
                                            <p className="text-xs text-slate-500 truncate">{report.comment}</p>
                                        )}
                                        <p className="text-xs text-slate-400">{formatDate(report.createdAt)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* View All / Collapse button */}
                        {reports.length > 2 && (
                            <button
                                onClick={() => setShowAllReports(!showAllReports)}
                                className="w-full mt-3 py-2 text-sm text-civic-600 font-medium hover:bg-civic-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                {showAllReports ? (
                                    <>
                                        Show Less
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        View All ({reports.length})
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
