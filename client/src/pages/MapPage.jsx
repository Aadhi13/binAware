import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Sample markers (placeholder for user-submitted data)
const sampleMarkers = [
    { id: 1, position: [12.9716, 77.5946], title: 'Overflowing Bin', description: 'Near park entrance' },
    { id: 2, position: [12.9756, 77.5906], title: 'Illegal Dumping', description: 'Behind shopping complex' },
];

function MapPage() {
    // Default center (Bangalore, India)
    const defaultCenter = [12.9716, 77.5946];
    const defaultZoom = 14;

    return (
        <div className="h-full w-full">
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                className="h-full w-full z-0"
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {sampleMarkers.map((marker) => (
                    <Marker key={marker.id} position={marker.position}>
                        <Popup>
                            <div className="text-sm">
                                <strong className="text-civic-700">{marker.title}</strong>
                                <p className="text-slate-600 mt-1">{marker.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default MapPage;
