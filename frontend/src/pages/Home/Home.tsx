import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import logo from '@/assets/logo.png';
import { MapWrapper } from '@/components/Map/MapWrapper';
import type { MapProvider } from '@/components/Map/MapWrapper';
import { AddressAutocomplete } from '@/components/Search/AddressAutocomplete';
import type { AddressResult } from '@/components/Search/AddressAutocomplete';
import { MapPin, Navigation, Truck, Loader2 } from 'lucide-react';
import apiClient from '@/api/client';

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [mapProvider, setMapProvider] = React.useState<MapProvider>('opensource');
  
  const [origin, setOrigin] = React.useState<AddressResult | null>(null);
  const [destination, setDestination] = React.useState<AddressResult | null>(null);
  
  const [routeData, setRouteData] = React.useState<{
      geometry: [number, number][];
      distance: number;
      duration: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = React.useState(false);

  // Fonction de calcul de l'itinéraire
  const calculateRoute = React.useCallback(async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
    setIsCalculating(true);
    try {
        const response = await apiClient.post('/logistics/calculate-route', {
            start: start,
            end: end
        }) as any;
        
        // Conversion GeoJSON [lng, lat] -> Leaflet [lat, lng]
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

  // Déclenchement automatique dès que les deux points sont présents
  React.useEffect(() => {
    if (origin && destination) {
        calculateRoute(origin.coords, destination.coords);
    } else {
        setRouteData(null);
    }
  }, [origin, destination, calculateRoute]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="RM Logistic Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">RM Logistique</h1>
          </div>
          <Button variant="destructive" onClick={logout}>Déconnexion</Button>
        </div>
        
        {/* welcome */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-blue-800 text-sm">
              Bienvenue, <span className="font-bold">{user?.email}</span> ! Portail de planification RM Logistique.
            </p>
          </CardContent>
        </Card>

        {/* Section Trajet et Carte */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-white border-b pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold text-slate-900">Planification de trajet</CardTitle>
              <p className="text-xs text-muted-foreground italic">Calculez vos segments de transport au Canada</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-md border text-[10px]">
              <button 
                onClick={() => setMapProvider('opensource')}
                className={`px-2 py-1 rounded-sm transition-all ${mapProvider === 'opensource' ? 'bg-white shadow-sm font-bold' : 'text-slate-500'}`}
              >
                OSM
              </button>
              <button 
                onClick={() => setMapProvider('google')}
                className={`px-2 py-1 rounded-sm transition-all ${mapProvider === 'google' ? 'bg-white shadow-sm font-bold' : 'text-slate-500'}`}
              >
                Google
              </button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-b bg-slate-50/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black flex items-center gap-1 text-green-700 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" /> Point de départ
                </label>
                <AddressAutocomplete 
                  provider={mapProvider} 
                  onAddressSelect={(res) => setOrigin(res)} 
                />
                {origin && <p className="text-[10px] text-slate-500 truncate px-1">{origin.label}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black flex items-center gap-1 text-red-700 uppercase tracking-wider">
                  <Navigation className="w-3 h-3" /> Destination
                </label>
                <AddressAutocomplete 
                  provider={mapProvider} 
                  onAddressSelect={(res) => setDestination(res)} 
                />
                {destination && <p className="text-[10px] text-slate-500 truncate px-1">{destination.label}</p>}
              </div>
            </div>

            <div className="relative">
                <MapWrapper 
                    provider={mapProvider} 
                    origin={origin?.coords} 
                    destination={destination?.coords} 
                    routeGeometry={routeData?.geometry}
                />
                
                {/* Overlay de stats de route */}
                {routeData && (
                    <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm border shadow-lg rounded-lg p-3 space-y-1 min-w-[150px]">
                        <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                            <Truck className="w-3 h-3 text-indigo-600" /> Itinéraire calculé
                        </p>
                        <div className="text-lg font-black text-slate-900 leading-none">
                            {routeData.distance} <span className="text-xs font-normal">km</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 font-bold italic">
                            Est. {routeData.duration} minutes
                        </p>
                    </div>
                )}

                {isCalculating && (
                    <div className="absolute inset-0 z-[1001] bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="bg-white px-4 py-2 rounded-full shadow-xl border flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                            <span className="text-xs font-bold text-slate-700">Calcul du trajet réel...</span>
                        </div>
                    </div>
                )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Home;
