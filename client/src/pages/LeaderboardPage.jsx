import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

function LeaderboardPage() {
    const { user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${API_BASE}/users/leaderboard`);

                if (!res.ok) throw new Error('Failed to fetch leaderboard');

                const data = await res.json();
                setLeaderboard(data);
            } catch (err) {
                console.error('Leaderboard error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [API_BASE]);

    const getTrophyIcon = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    const getRankColor = (rank) => {
        if (rank === 1) return 'from-yellow-400 to-amber-500';
        if (rank === 2) return 'from-slate-300 to-slate-400';
        if (rank === 3) return 'from-orange-400 to-amber-600';
        return 'from-slate-100 to-slate-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100dvh-4rem)] p-5 pb-20">
            <Header title="Leaderboard" subtitle="Top contributors" />

            {error && (
                <div className="mb-4 max-w-sm mx-auto bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="max-w-sm mx-auto">
                {/* Trophy Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 mb-4 text-white text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <h2 className="text-lg font-bold">Top 10 Contributors</h2>
                    <p className="text-xs text-white/80 mt-1">Making our city cleaner!</p>
                </div>

                {/* Leaderboard List */}
                <div className="space-y-2">
                    {leaderboard.map((entry, index) => {
                        const rank = index + 1;
                        const isCurrentUser = user?.email === entry.email || user?._id === entry._id;
                        const trophy = getTrophyIcon(rank);

                        return (
                            <div
                                key={entry._id}
                                className={`rounded-xl overflow-hidden transition-all ${isCurrentUser
                                        ? 'bg-gradient-to-r from-civic-500 to-civic-600 text-white ring-2 ring-civic-400 shadow-lg'
                                        : 'bg-white shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-center p-4 gap-3">
                                    {/* Rank */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${isCurrentUser ? 'from-white/20 to-white/10' : getRankColor(rank)
                                        } flex items-center justify-center`}>
                                        {trophy ? (
                                            <span className="text-2xl">{trophy}</span>
                                        ) : (
                                            <span className={`text-lg font-bold ${isCurrentUser ? 'text-white' : 'text-slate-600'
                                                }`}>
                                                #{rank}
                                            </span>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-grow min-w-0">
                                        <p className={`font-semibold truncate ${isCurrentUser ? 'text-white' : 'text-slate-800'
                                            }`}>
                                            {entry.name || 'Anonymous'}
                                            {isCurrentUser && (
                                                <span className="ml-2 text-xs font-normal bg-white/20 px-2 py-0.5 rounded-full">
                                                    You
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <svg className={`w-3 h-3 ${isCurrentUser ? 'text-white/80' : 'text-amber-500'
                                                }`} fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                            </svg>
                                            <span className={`text-xs ${isCurrentUser ? 'text-white/80' : 'text-slate-500'
                                                }`}>
                                                Rank {rank}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div className="flex-shrink-0 text-right">
                                        <p className={`text-2xl font-bold ${isCurrentUser ? 'text-white' : 'text-civic-600'
                                            }`}>
                                            {entry.points}
                                        </p>
                                        <p className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-slate-400'
                                            }`}>
                                            points
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {leaderboard.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <div className="text-4xl mb-3">📊</div>
                        <p className="text-sm text-slate-500">No data yet</p>
                        <p className="text-xs text-slate-400 mt-1">Be the first to contribute!</p>
                    </div>
                )}

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-900">How to earn points</p>
                            <ul className="mt-2 space-y-1 text-xs text-blue-700">
                                <li>• Report an issue: <strong>+10 points</strong></li>
                                <li>• Add a bin location: <strong>+5 points</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeaderboardPage;
