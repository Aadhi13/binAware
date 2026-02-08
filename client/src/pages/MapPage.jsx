import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Custom marker icons for reports (circles)
const createReportIcon = (color) => {
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

// Custom marker icons for bins (squares with bin icon)
const createBinIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// User location marker with pulsing animation
const createUserIcon = () => {
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative">
        <!-- Pulsing ring -->
        <div style="
          position: absolute;
          top: -12px;
          left: -12px;
          width: 40px;
          height: 40px;
          background-color: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        <!-- Inner dot with person icon -->
        <div style="
          position: relative;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.8);
            opacity: 1;
          }
        }
      </style>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const reportColors = {
  'overflow': '#ef4444',      // red
  'missing-bin': '#1f2937',   // black/dark gray
  'misused-bin': '#eab308',   // yellow
  'littered-area': '#3b82f6', // blue
};

const binColors = {
  'good': '#22c55e',      // green
  'overflow': '#ef4444',  // red
  'missing': '#6b7280',   // gray
  'misused': '#eab308',   // yellow
};

const reportTypeLabels = {
  'overflow': 'Overflowing Bin',
  'missing-bin': 'Missing Bin',
  'misused-bin': 'Misused Bin',
  'littered-area': 'Littered Area',
};

const binStatusLabels = {
  'good': 'Good Condition',
  'overflow': 'Overflowing',
  'missing': 'Missing/Removed',
  'misused': 'Misused/Damaged',
};

// Intensity weights by report type
const intensityWeights = {
  'overflow': 1.2,
  'littered-area': 1.0,
  'missing-bin': 0.8,
  'misused-bin': 0.8,
};

// Heatmap layer component
function HeatmapLayer({ reports, showHeatmap }) {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!showHeatmap) {
      // Remove heatmap if it exists
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // Create heatmap data points with intensity
    const heatData = reports.map((report) => [
      report.lat,
      report.lng,
      intensityWeights[report.type] || 1.0,
    ]);

    // Remove existing heatmap layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Create new heatmap layer with vibrant colors
    if (heatData.length > 0) {
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 30,
        blur: 20,
        maxZoom: 17,
        max: 1.2,
        gradient: {
          0.0: '#0ea5e9',  // sky blue
          0.2: '#06b6d4',  // cyan
          0.4: '#10b981',  // emerald
          0.6: '#fbbf24',  // amber
          0.8: '#f97316',  // orange
          1.0: '#dc2626',  // red
        },
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, reports, showHeatmap]);

  return null;
}

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

function MapPage() {
  const [reports, setReports] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLayer, setShowLayer] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Geolocation and routing state
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const mapRef = useRef(null);

  const center = [12.9716, 77.5946];

  // Function to recenter map to user location
  const recenterToUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 16, {
        animate: true,
        duration: 0.5
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

        const [reportsRes, binsRes] = await Promise.all([
          fetch(`${API_BASE}/reports`),
          fetch(`${API_BASE}/bins`)
        ]);

        if (!reportsRes.ok) throw new Error('Failed to fetch reports');
        if (!binsRes.ok) throw new Error('Failed to fetch bins');

        const [reportsData, binsData] = await Promise.all([
          reportsRes.json(),
          binsRes.json()
        ]);

        setReports(reportsData);
        setBins(binsData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
        }
      );
    } else {
      console.error('Geolocation not supported');
    }
  }, []);

  const getDirections = async (bin) => {
    if (!userLocation) {
      alert('Location not available. Please enable location services.');
      return;
    }

    setLoadingRoute(true);
    setRoute(null);
    setRouteInfo(null);

    try {
      const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;
      const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${userLocation.lng},${userLocation.lat}&end=${bin.lng},${bin.lat}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const coordinates = data.features[0].geometry.coordinates;
        // Convert [lng, lat] to [lat, lng] for Leaflet
        const routeCoords = coordinates.map(coord => [coord[1], coord[0]]);

        const distance = data.features[0].properties.segments[0].distance;
        const duration = data.features[0].properties.segments[0].duration;

        setRoute(routeCoords);
        setRouteInfo({
          distance: (distance / 1000).toFixed(2), // km
          duration: Math.round(duration / 60), // minutes
          binStatus: bin.status
        });
      }
    } catch (err) {
      console.error('Route error:', err);
      alert('Failed to get directions. Please try again.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const clearRoute = () => {
    setRoute(null);
    setRouteInfo(null);
  };

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
      {/* Map */}
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

        {/* Map ref setter */}
        <MapRefSetter mapRef={mapRef} />

        {/* Heatmap layer */}
        <HeatmapLayer reports={reports} showHeatmap={showHeatmap} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-blue-600">📍 Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {route && (
          <Polyline
            positions={route}
            color="#3b82f6"
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Report markers */}
        {!showHeatmap && (showLayer === 'all' || showLayer === 'reports') && reports.map((report) => (
          <Marker
            key={`report-${report._id}`}
            position={[report.lat, report.lng]}
            icon={createReportIcon(reportColors[report.type] || '#6b7280')}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-slate-800 mb-1">
                  📋 {reportTypeLabels[report.type] || report.type}
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

        {/* Bin markers with directions */}
        {!showHeatmap && (showLayer === 'all' || showLayer === 'bins') && bins.map((bin) => (
          <Marker
            key={`bin-${bin._id}`}
            position={[bin.lat, bin.lng]}
            icon={createBinIcon(binColors[bin.status] || '#6b7280')}
          >
            <Popup>
              <div className="text-sm min-w-[150px]">
                <p className="font-semibold text-slate-800 mb-1">
                  🗑️ Bin - {binStatusLabels[bin.status] || bin.status}
                </p>
                <p className="text-xs text-slate-400 mb-2">Added {formatDate(bin.createdAt)}</p>

                {userLocation && (
                  <button
                    onClick={() => getDirections(bin)}
                    disabled={loadingRoute}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors disabled:opacity-50"
                  >
                    {loadingRoute ? 'Loading...' : '🚶 Get Directions'}
                  </button>
                )}

                {!userLocation && (
                  <p className="text-xs text-amber-600">Enable location for directions</p>
                )}
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

      {/* Route info panel */}
      {routeInfo && (
        <div className="absolute top-2 left-2 right-2 max-w-sm mx-auto bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">Walking Directions</p>
              <p className="text-xs text-slate-500">To {binStatusLabels[routeInfo.binStatus]} bin</p>
            </div>
            <button
              onClick={clearRoute}
              className="text-slate-400 hover:text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-sm font-medium text-slate-700">{routeInfo.distance} km</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-700">{routeInfo.duration} min</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls - Top Right */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 z-[999]">
        {/* Layer toggle */}
        <div className="bg-white rounded-lg shadow-md p-1">
          <div className="flex gap-1">
            {['all', 'reports', 'bins'].map((layer) => (
              <button
                key={layer}
                onClick={() => { setShowLayer(layer); setShowHeatmap(false); }}
                className={`px-2 py-1 text-xs rounded font-medium transition-colors capitalize
                                    ${showLayer === layer && !showHeatmap ? 'bg-civic-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap toggle */}
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-2 rounded-lg shadow-md text-xs font-medium transition-all flex items-center gap-1.5
                        ${showHeatmap
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
          {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
        </button>

        {/* Locate Me button */}
        {userLocation && (
          <button
            onClick={recenterToUser}
            className="px-3 py-2 rounded-lg shadow-md text-xs font-medium transition-all flex items-center gap-1.5 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100"
            title="Go to my location"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Locate Me
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[999] rounded-lg bg-white/95 px-2 py-1.5 shadow-md">
        {showHeatmap ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-slate-600">Intensity:</span>
            <div className="flex items-center gap-1">
              <div
                className="h-3 w-20 rounded-full"
                style={{
                  background: 'linear-gradient(to right, #0ea5e9 0%, #06b6d4 20%, #10b981 40%, #fbbf24 60%, #f97316 80%, #dc2626 100%)'
                }}
              ></div>
            </div>
            <span className="text-slate-500">Low → High</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 text-xs">
            {/* Report legend */}
            {(showLayer === 'all' || showLayer === 'reports') && Object.entries(reportColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="hidden text-slate-600 sm:inline">
                  {reportTypeLabels[type].split(' ')[0]}
                </span>
              </div>
            ))}
            {/* Bin legend */}
            {(showLayer === 'all' || showLayer === 'bins') && (
              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <span className="h-2 w-2 rounded-sm bg-green-500"></span>
                <span className="hidden text-slate-600 sm:inline">Bins</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapPage;
