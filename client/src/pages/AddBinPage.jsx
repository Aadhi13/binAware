import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import Header from '../components/Header';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';

// Custom marker icon
const markerIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: #22c55e;
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

function AddBinPage() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [status, setStatus] = useState('good');
    const [location, setLocation] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);

    const mapRef = useRef(null);

    const defaultCenter = [12.9716, 77.5946];

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

            const binData = {
                lat: location.lat,
                lng: location.lng,
                status,
            };

            const res = await fetch(`${API_BASE}/bins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(binData),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ type: 'success', text: 'Bin added! (+1 Point)' });
                setStatus('good');
                setLocation(null);
                setShowMap(false);

                setTimeout(() => {
                    navigate('/dashboard/map');
                }, 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to add bin' });
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

    const statusOptions = [
        { value: 'good', label: 'Good Condition', color: '#22c55e' },
        { value: 'overflow', label: 'Overflowing', color: '#ef4444' },
        { value: 'missing', label: 'Missing/Removed', color: '#6b7280' },
        { value: 'misused', label: 'Misused/Damaged', color: '#eab308' },
    ];

    return (
        <div className="min-h-[calc(100dvh-4rem)] flex flex-col justify-center p-5 pb-20">
            <div className="max-w-sm mx-auto w-full">
                <Header title="Add Bin" subtitle="Mark a bin location on the map" />

                {message.text && (
                    <div className="mb-4 mt-6">
                        <Message type={message.type}>{message.text}</Message>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-8">

                    {/* Location Picker */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Bin Location
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
                                        Tap to pin bin location
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

                    {/* Bin Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Bin Status
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setStatus(option.value)}
                                    className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2
                                        ${status === option.value
                                            ? 'border-civic-500 bg-civic-50 text-civic-700'
                                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: option.color }}
                                    ></span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary text-sm py-2.5"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Add Bin'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddBinPage;
