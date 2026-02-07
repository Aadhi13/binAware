import PropTypes from 'prop-types';

function Header({ title = 'binAware', subtitle }) {
    return (
        <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
                {/* Logo Icon */}
                <div className="w-12 h-12 bg-civic-600 rounded-xl flex items-center justify-center">
                    <svg
                        className="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            </div>
            {subtitle && (
                <p className="text-slate-500 text-sm">{subtitle}</p>
            )}
        </header>
    );
}

Header.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
};

export default Header;
