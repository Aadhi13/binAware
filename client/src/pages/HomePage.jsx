import PropTypes from 'prop-types';
import Header from '../components/Header';

function HomePage({ onNavigate }) {
    return (
        <div className="page-container bg-gradient-to-br from-civic-50 to-slate-100">
            <div className="card text-center">
                <Header
                    title="binAware"
                    subtitle="Your civic reporting companion"
                />

                <p className="text-slate-600 mb-8 leading-relaxed">
                    Report issues in your community and help make your neighborhood a better place.
                    Quick, easy, and effective.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => onNavigate('login')}
                        className="btn-primary"
                        type="button"
                    >
                        Login
                    </button>

                    <button
                        onClick={() => onNavigate('register')}
                        className="btn-secondary"
                        type="button"
                    >
                        Create Account
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-400">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
}

HomePage.propTypes = {
    onNavigate: PropTypes.func.isRequired,
};

export default HomePage;
