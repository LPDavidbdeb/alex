import React from 'react';
import { GoogleMapProvider } from './GoogleMapProvider';
import { LeafletMapProvider } from './LeafletMapProvider';

export type MapProvider = 'google' | 'opensource';

interface MapWrapperProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  provider?: MapProvider;
}

/**
 * Composant Map universel pour RM Logistique.
 * Permet de basculer entre Google Maps et OpenStreetMap de manière transparente.
 */
export const MapWrapper: React.FC<MapWrapperProps> = ({ 
  center = { lat: 45.504, lng: -73.557 }, // Montréal par défaut
  zoom = 13, 
  provider = 'opensource' 
}) => {
  return (
    <div className="h-[400px] w-full relative overflow-hidden shadow-inner border rounded-lg bg-slate-50">
      {provider === 'google' ? (
        <GoogleMapProvider center={center} zoom={zoom} />
      ) : (
        <LeafletMapProvider center={center} zoom={zoom} />
      )}
      
      {/* Badge du provider pour la transparence */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-600 border shadow-sm">
        Provider: {provider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
      </div>
    </div>
  );
};
