import React from 'react';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom: number;
}

/**
 * Placeholder pour Google Maps.
 * Dans une implémentation réelle, on utiliserait @react-google-maps/api
 */
export const GoogleMapProvider: React.FC<GoogleMapProps> = ({ center, zoom }) => {
  return (
    <div 
      style={{ 
        height: '100%', 
        width: '100%', 
        backgroundColor: '#e5e7eb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        border: '1px solid #d1d5db'
      }}
    >
      <div className="text-center p-4">
        <p className="font-bold text-slate-700">Moteur Google Maps</p>
        <p className="text-sm text-slate-500">
          Centre: {center.lat}, {center.lng} | Zoom: {zoom}
        </p>
        <p className="text-xs mt-2 italic text-slate-400">
          (Nécessite l'activation de la facturation Google Cloud)
        </p>
      </div>
    </div>
  );
};
