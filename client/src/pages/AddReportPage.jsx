import { useState } from 'react';
import Header from '../components/Header';
import Message from '../components/Message';

function AddReportPage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Simulate API call (placeholder for actual implementation)
        setTimeout(() => {
            setMessage({ type: 'success', text: 'Report submitted successfully!' });
            setFormData({ title: '', description: '', location: '' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <Header title="Add Report" subtitle="Report bin misuse in your area" />

            {message.text && (
                <div className="mb-6">
                    <Message type={message.type}>{message.text}</Message>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Report Title
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Overflowing garbage bin"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label
                        htmlFor="location"
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Location
                    </label>
                    <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Near City Park entrance"
                        required
                        disabled={loading}
                    />
                </div>

                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Describe the issue in detail..."
                        required
                        disabled={loading}
                    />
                </div>

                {/* Photo upload placeholder */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Photo (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                        <svg
                            className="w-10 h-10 mx-auto text-slate-400 mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-sm text-slate-500">Tap to add photo</p>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}

export default AddReportPage;
