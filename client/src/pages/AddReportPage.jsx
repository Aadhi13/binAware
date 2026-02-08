import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import Header from '../components/Header';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

// Custom marker icon for Report (Red)
const markerIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #ef4444;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
});

// Component to set map ref
function MapRefSetter({ mapRef }) {
    const map = useMap();

    useEffect(() => {
        if (map) {
            mapRef.current = map;
        }
    }, [map, mapRef]);

    return null;
}

// Location Picker Component
function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={markerIcon}></Marker>
    );
}

function AddReportPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        type: 'overflow',
        comment: '',
        photoUrl: '',
    });
    const [location, setLocation] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [uploading, setUploading] = useState(false);

    const mapRef = useRef(null);

    const defaultCenter = [12.9716, 77.5946];

    // Cloudinary config from environment
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const openCloudinaryWidget = () => {
        if (!window.cloudinary) {
            setMessage({ type: 'error', text: 'Upload widget not loaded. Please refresh.' });
            return;
        }

        const widget = window.cloudinary.createUploadWidget(
            {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                sources: ['local', 'camera'],
                multiple: false,
                maxFiles: 1,
                cropping: true,
                croppingAspectRatio: 4 / 3,
                resourceType: 'image',
                folder: 'binaware-reports',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                maxFileSize: 5000000, // 5MB
                styles: {
                    palette: {
                        window: '#FFFFFF',
                        windowBorder: '#94A3B8',
                        tabIcon: '#0D9488',
                        menuIcons: '#64748B',
                        textDark: '#1E293B',
                        textLight: '#FFFFFF',
                        link: '#0D9488',
                        action: '#0D9488',
                        inactiveTabIcon: '#94A3B8',
                        error: '#EF4444',
                        inProgress: '#0D9488',
                        complete: '#10B981',
                        sourceBg: '#F8FAFC'
                    },
                    fonts: {
                        default: {
                            active: true
                        }
                    }
                }
            },
            (error, result) => {
                if (error) {
                    console.error('Upload error:', error);
                    setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
                    setUploading(false);
                    return;
                }

                if (result.event === 'success') {
                    const url = result.info.secure_url;
                    setFormData(prev => ({ ...prev, photoUrl: url }));
                    setMessage({ type: 'success', text: 'Photo uploaded!' });
                    setUploading(false);
                    setTimeout(() => setMessage({ type: '', text: '' }), 2000);
                }
            }
        );

        setUploading(true);
        widget.open();
    };

    const removePhoto = () => {
        setFormData(prev => ({ ...prev, photoUrl: '' }));
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
            const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
                setMessage({ type: 'success', text: 'Report submitted! (+1 Point)' });
                setFormData({ type: 'overflow', comment: '', photoUrl: '' });
                setLocation(null);
                setShowMap(false);

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

    const handleLocateMe = () => {
        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
            return;
        }

        setMessage({ type: 'info', text: 'Locating...' });

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const latlng = { lat: latitude, lng: longitude };

                setLocation(latlng);
                setMessage({ type: 'success', text: 'Location found!' });

                if (mapRef.current) {
                    mapRef.current.flyTo(latlng, 16);
                }
            },
            (error) => {
                console.error(error);
                setMessage({ type: 'error', text: 'Unable to retrieve your location. Please check permissions.' });
            }
        );
    };

    return (
        <div className="min-h-[calc(100dvh-4rem)] flex flex-col justify-center p-5 pb-20">
            <div className="max-w-sm mx-auto w-full">
                <Header title="Add Report" subtitle="Flag an issue in your area" />

                {message.text && (
                    <div className="mb-4 mt-6">
                        <Message type={message.type}>{message.text}</Message>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-8">

                    {/* Report Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Issue Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="input-field appearance-none bg-no-repeat bg-right text-sm"
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
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Location
                        </label>

                        {!showMap ? (
                            <button
                                type="button"
                                onClick={toggleMap}
                                className={`w-full py-2.5 px-3 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors text-sm
                    ${location ? 'border-civic-500 bg-civic-50 text-civic-700' : 'border-slate-300 text-slate-500 hover:border-civic-400 hover:text-civic-600'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {location ? 'Location Selected (Tap to change)' : 'Select Location on Map'}
                            </button>
                        ) : (
                            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-slate-300">
                                <MapContainer
                                    center={location || defaultCenter}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap'
                                    />
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap'
                                    />
                                    <MapRefSetter mapRef={mapRef} />
                                    <LocationMarker position={location} setPosition={setLocation} />
                                </MapContainer>

                                {/* Controls */}
                                <div className="absolute top-2 right-2 flex flex-col gap-2 z-[1000]">
                                    <button
                                        type="button"
                                        onClick={toggleMap}
                                        className="bg-white p-1.5 rounded shadow-md text-slate-600 hover:text-red-500"
                                        title="Close Map"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleLocateMe}
                                        className="bg-white p-1.5 rounded shadow-md text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        title="Locate Me"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none z-[1000]">
                                    <span className="bg-white/90 px-2 py-0.5 rounded-full text-xs font-medium text-civic-700 shadow-sm">
                                        Tap to pin location
                                    </span>
                                </div>
                            </div>
                        )}
                        {location && !showMap && (
                            <p className="text-xs text-green-600 mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Details (Optional)
                        </label>
                        <textarea
                            id="comment"
                            name="comment"
                            value={formData.comment}
                            onChange={handleChange}
                            rows={2}
                            className="input-field resize-none text-sm"
                            placeholder="Describe the issue..."
                            disabled={loading}
                        />
                    </div>

                    {/* Photo Upload - Cloudinary */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Photo (Optional)
                        </label>

                        {!formData.photoUrl ? (
                            <button
                                type="button"
                                onClick={openCloudinaryWidget}
                                disabled={loading || uploading}
                                className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-slate-300 
                                    flex items-center justify-center gap-2 text-sm text-slate-500
                                    hover:border-civic-400 hover:text-civic-600 hover:bg-civic-50 transition-colors
                                    disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin h-4 w-4 border-2 border-civic-600 border-t-transparent rounded-full"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Upload Photo
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="relative">
                                <img
                                    src={formData.photoUrl}
                                    alt="Uploaded"
                                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                                />
                                <button
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <p className="text-xs text-green-600 mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Photo uploaded to cloud
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary text-sm py-2.5"
                        disabled={loading || uploading}
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddReportPage;
