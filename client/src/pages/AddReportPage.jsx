import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import Header from '../components/Header';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';

// Location Picker Component
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

function AddReportPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        type: 'overflow',
        comment: '',
        photoUrl: '', // For now, just a placeholder or could be used if we had upload
    });
    const [location, setLocation] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Default to Bangalore
    const defaultCenter = [12.9716, 77.5946];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        // Placeholder for file handling
        // In a real app, strict file upload would happen here
        // For now, we'll just log it or set a dummy URL
        const file = e.target.files[0];
        if (file) {
            // Mocking a URL for the "uploaded" file
            setFormData(prev => ({ ...prev, photoUrl: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!location) {
            setMessage({ type: 'error', text: 'Please select a location on the map' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const reportData = {
                ...formData,
                lat: location.lat,
                lng: location.lng
            };

            const res = await fetch(`${API_BASE}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reportData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Report submitted successfully! (+1 Point)' });
                // Clear form
                setFormData({ type: 'overflow', comment: '', photoUrl: '' });
                setLocation(null);
                setShowMap(false);

                // Redirect after short delay
                setTimeout(() => {
                    navigate('/dashboard/profile');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to submit report' });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const toggleMap = () => setShowMap(!showMap);

    return (
        <div className="p-6 max-w-md mx-auto pb-24">
            <Header title="Add Report" subtitle="Flag an issue in your area" />

            {message.text && (
                <div className="mb-6">
                    <Message type={message.type}>{message.text}</Message>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Report Type */}
                <div>
                    <label
                        htmlFor="type"
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Issue Type
                    </label>
                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="input-field appearance-none bg-no-repeat bg-right"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                        disabled={loading}
                    >
                        <option value="overflow">Overflowing Bin</option>
                        <option value="missing-bin">Missing Bin</option>
                        <option value="misused-bin">Misused Bin</option>
                        <option value="littered-area">Littered Area</option>
                    </select>
                </div>

                {/* Location Picker */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Location
                    </label>

                    {!showMap ? (
                        <button
                            type="button"
                            onClick={toggleMap}
                            className={`w-full py-3 px-4 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors
                    ${location ? 'border-civic-500 bg-civic-50 text-civic-700' : 'border-slate-300 text-slate-500 hover:border-civic-400 hover:text-civic-600'}`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {location ? 'Location Selected (Tap to change)' : 'Select Location on Map'}
                        </button>
                    ) : (
                        <div className="relative h-64 w-full rounded-lg overflow-hidden border border-slate-300">
                            <MapContainer
                                center={location || defaultCenter}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                zoomControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                />
                                <LocationMarker position={location} setPosition={setLocation} />
                            </MapContainer>
                            <button
                                type="button"
                                onClick={toggleMap}
                                className="absolute top-2 right-2 bg-white p-1 rounded shadow-md z-[1000] text-slate-600 hover:text-red-500"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-[1000]">
                                <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-civic-700 shadow-sm">
                                    Tap map to pin location
                                </span>
                            </div>
                        </div>
                    )}
                    {location && !showMap && (
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Coordinates: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div>
                    <label
                        htmlFor="comment"
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        Additional Details (Optional)
                    </label>
                    <textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleChange}
                        rows={3}
                        className="input-field resize-none"
                        placeholder="Describe the issue..."
                        disabled={loading}
                    />
                </div>

                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Photo (Optional)
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-civic-50 file:text-civic-700
              hover:file:bg-civic-100
            "
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Submitting Report...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}

export default AddReportPage;
