import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Correction icônes
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Composant interne pour ajuster la vue
const ChangeView = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (points && points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [points, map]);
  return null;
};

interface LeafletMapProps {
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
  routeGeometry?: [number, number][] | null;
  center: { lat: number; lng: number };
  zoom: number;
}

export const LeafletMapProvider: React.FC<LeafletMapProps> = ({ origin, destination, routeGeometry, center, zoom }) => {
  const points = useMemo(() => {
    const pts: [number, number][] = [];
    if (origin) pts.push([origin.lat, origin.lng]);
    if (destination) pts.push([destination.lat, destination.lng]);
    return pts;
  }, [origin, destination]);

  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <ChangeView points={points} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {origin && (
        <Marker position={[origin.lat, origin.lng]}>
          <Popup>Point de départ</Popup>
        </Marker>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lng]}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {/* Rendu de la route réelle */}
      {routeGeometry && routeGeometry.length > 0 && (
        <Polyline 
          key={`route-${routeGeometry.length}-${routeGeometry[0][0]}`} // Clé unique pour forcer le rafraîchissement
          positions={routeGeometry} 
          color="#3b82f6" 
          weight={6} 
          opacity={0.8}
        />
      )}

      {/* Ligne pointillée temporaire si pas encore d'itinéraire réel */}
      {!routeGeometry && origin && destination && (
        <Polyline 
          positions={[[origin.lat, origin.lng], [destination.lat, destination.lng]]} 
          color="#94a3b8" 
          weight={3} 
          dashArray="5, 10"
        />
      )}
    </MapContainer>
  );
};
