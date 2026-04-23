import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Navbar } from '@/components/Navbar';
import { MapWrapper } from '@/components/Map/MapWrapper';
import type { MapProvider } from '@/components/Map/MapWrapper';
import { AddressAutocomplete, type AddressResult } from '@/components/Search/AddressAutocomplete';
import { CountrySelector } from '@/components/Search/CountrySelector';
import { MapPin, Navigation, Truck, Loader2 } from 'lucide-react';
import apiClient from '@/api/client';

interface RouteResponse {
  geometry: [number, number][];
  distance_km: number;
  duration_min: number;
}

const Home: React.FC = () => {
  const [mapProvider, setMapProvider] = React.useState<MapProvider>('opensource');
  
  // Country Filters
  const [originCountry, setOriginCountry] = React.useState('CA');
  const [destCountry, setDestCountry] = React.useState('CA');

  const [origin, setOrigin] = React.useState<AddressResult | null>(null);
  const [destination, setDestination] = React.useState<AddressResult | null>(null);
  
  const [routeData, setRouteData] = React.useState<{
      geometry: [number, number][];
      distance: number;
      duration: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  const calculateRoute = React.useCallback(async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
    setIsCalculating(true);
    try {
        const response = await apiClient.post('/logistics/calculate-route', {
            start: start,
            end: end
        }) as RouteResponse;
        
        if (response.geometry && Array.isArray(response.geometry)) {
            const formattedGeometry = response.geometry.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
            
            setRouteData({
                geometry: formattedGeometry,
                distance: response.distance_km,
                duration: response.duration_min
            });
        }
    } catch (error) {
        console.error("Erreur calcul itinéraire:", error);
    } finally {
        setIsCalculating(false);
    }
  }, []);

  React.useEffect(() => {
    if (origin && destination) {
        calculateRoute(
            { lat: origin.latitude, lng: origin.longitude }, 
            { lat: destination.latitude, lng: destination.longitude }
        );
    } else {
        setRouteData(null);
    }
  }, [origin, destination, calculateRoute]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <Card className="overflow-hidden shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-900 uppercase tracking-tight">Planification Internationale</CardTitle>
              <p className="text-xs text-muted-foreground italic">Sélectionnez le pays avant de rechercher l'adresse</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-md border text-[10px]">
              <button onClick={() => setMapProvider('opensource')} className={`px-2 py-1 rounded-sm transition-all ${mapProvider === 'opensource' ? 'bg-white shadow-sm font-bold' : 'text-slate-500'}`}>OSM</button>
              <button onClick={() => setMapProvider('google')} className={`px-2 py-1 rounded-sm transition-all ${mapProvider === 'google' ? 'bg-white shadow-sm font-bold' : 'text-slate-500'}`}>Google</button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b bg-slate-50/50">
              {/* Pickup Section */}
              <div className="space-y-4">
                <CountrySelector value={originCountry} onChange={setOriginCountry} label="Pays de départ" />
                <div className="space-y-2">
                    <label className="text-[10px] font-black flex items-center gap-1 text-green-700 uppercase">
                    <MapPin className="w-3 h-3" /> Adresse de départ
                    </label>
                    <AddressAutocomplete 
                        onAddressSelect={setOrigin} 
                        country={originCountry} 
                        placeholder="Rue, Numéro, Ville..."
                    />
                    {origin && <p className="text-[10px] text-slate-500 italic truncate px-1">{origin.label}</p>}
                </div>
              </div>

              {/* Destination Section */}
              <div className="space-y-4">
                <CountrySelector value={destCountry} onChange={setDestCountry} label="Pays d'arrivée" />
                <div className="space-y-2">
                    <label className="text-[10px] font-black flex items-center gap-1 text-red-700 uppercase">
                    <Navigation className="w-3 h-3" /> Adresse de destination
                    </label>
                    <AddressAutocomplete 
                        onAddressSelect={setDestination} 
                        country={destCountry}
                        placeholder="Rue, Numéro, Ville..."
                    />
                    {destination && <p className="text-[10px] text-slate-500 italic truncate px-1">{destination.label}</p>}
                </div>
              </div>
            </div>

            <div className="relative">
                <MapWrapper 
                    provider={mapProvider} 
                    origin={origin ? { lat: origin.latitude, lng: origin.longitude } : undefined} 
                    destination={destination ? { lat: destination.latitude, lng: destination.longitude } : undefined} 
                    routeGeometry={routeData?.geometry}
                />
                
                {routeData && (
                    <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm border shadow-lg rounded-lg p-3 space-y-1 min-w-[150px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Truck className="w-3 h-3 text-indigo-600" /> Itinéraire
                        </p>
                        <div className="text-lg font-black text-slate-900 leading-none">
                            {routeData.distance} <span className="text-xs font-normal text-slate-500">km</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-bold italic">
                            Est. {routeData.duration} min
                        </p>
                    </div>
                )}

                {isCalculating && (
                    <div className="absolute inset-0 z-[1001] bg-white/40 backdrop-blur-[1px] flex items-center justify-center text-xs font-bold text-slate-700">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mr-2" /> Calcul du trajet...
                    </div>
                )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
