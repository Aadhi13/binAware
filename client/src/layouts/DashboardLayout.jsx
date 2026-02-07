import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Icons for bottom nav
const MapIcon = ({ active }) => (
    <svg
        className={`w-6 h-6 ${active ? 'text-civic-600' : 'text-slate-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
    </svg>
);

const AddIcon = ({ active }) => (
    <svg
        className={`w-6 h-6 ${active ? 'text-civic-600' : 'text-slate-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
);

const ProfileIcon = ({ active }) => (
    <svg
        className={`w-6 h-6 ${active ? 'text-civic-600' : 'text-slate-400'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
    </svg>
);

function DashboardLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        { to: '/dashboard/map', label: 'Map', Icon: MapIcon },
        { to: '/dashboard/add', label: 'Report', Icon: AddIcon },
        { to: '/dashboard/profile', label: 'Profile', Icon: ProfileIcon },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Main content */}
            <main className="h-[calc(100vh-5rem)]">
                <Outlet />
            </main>

            {/* Fixed bottom navigation - full width, icons centered together */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg">
                <div className="flex justify-around items-center h-20 max-w-md mx-auto">
                    {navItems.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-colors
                ${isActive ? 'text-civic-600' : 'text-slate-400 hover:text-slate-600'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon active={isActive} />
                                    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-civic-600' : ''}`}>
                                        {label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}

export default DashboardLayout;
