import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icons based on report type
const createMarkerIcon = (color) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
    });
};

const markerColors = {
    'overflow': '#ef4444',      // red
    'missing-bin': '#1f2937',   // black/dark gray
    'misused-bin': '#eab308',   // yellow
    'littered-area': '#3b82f6', // blue
};

const typeLabels = {
    'overflow': 'Overflowing Bin',
    'missing-bin': 'Missing Bin',
    'misused-bin': 'Misused Bin',
    'littered-area': 'Littered Area',
};

function MapPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Bangalore center
    const center = [12.9716, 77.5946];

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const res = await fetch(`${API_BASE}/reports`);

                if (!res.ok) {
                    throw new Error('Failed to fetch reports');
                }

                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error('Fetch reports error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative w-full" style={{ height: 'calc(100dvh - 80px)' }}>
            {/* Map - Full screen minus bottom nav */}
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />

                {reports.map((report) => (
                    <Marker
                        key={report._id}
                        position={[report.lat, report.lng]}
                        icon={createMarkerIcon(markerColors[report.type] || '#6b7280')}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-semibold text-slate-800 mb-1">
                                    {typeLabels[report.type] || report.type}
                                </p>
                                {report.comment && (
                                    <p className="text-slate-600 text-xs mb-1">{report.comment}</p>
                                )}
                                {report.photoUrl && (
                                    <img src={report.photoUrl} alt="" className="w-full h-16 object-cover rounded mb-1" />
                                )}
                                <p className="text-xs text-slate-400">{formatDate(report.createdAt)}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1000]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-600"></div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="absolute top-2 left-2 right-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg z-[1000] text-xs">
                    {error}
                </div>
            )}

            {/* Compact Legend */}
            <div className="absolute bottom-2 left-2 bg-white/95 rounded-lg shadow-md px-2 py-1.5 z-[1000]">
                <div className="flex gap-3 text-xs">
                    {Object.entries(markerColors).map(([type, color]) => (
                        <div key={type} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                            <span className="text-slate-600 hidden sm:inline">{typeLabels[type].split(' ')[0]}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MapPage;
