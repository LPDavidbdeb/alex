import React from 'react';
import { GoogleMapProvider } from './GoogleMapProvider';
import { LeafletMapProvider } from './LeafletMapProvider';

export type MapProvider = 'google' | 'opensource';

interface MapWrapperProps {
  origin?: { lat: number; lng: number } | null;
  destination?: { lat: number; lng: number } | null;
  routeGeometry?: [number, number][] | null;
  center?: { lat: number; lng: number };
  zoom?: number;
  provider?: MapProvider;
}

export const MapWrapper: React.FC<MapWrapperProps> = ({ 
  origin = null,
  destination = null,
  routeGeometry = null,
  center = { lat: 45.504, lng: -73.557 },
  zoom = 13, 
  provider = 'opensource' 
}) => {
  return (
    <div className="h-[450px] w-full relative overflow-hidden shadow-inner border rounded-lg bg-slate-50">
      {provider === 'google' ? (
        <GoogleMapProvider center={center} zoom={zoom} />
      ) : (
        <LeafletMapProvider 
            origin={origin} 
            destination={destination} 
            routeGeometry={routeGeometry}
            center={center} 
            zoom={zoom} 
        />
      )}
      
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-slate-600 border shadow-sm">
        Provider: {provider === 'google' ? 'Google Maps' : 'OpenStreetMap'}
      </div>
    </div>
  );
};
