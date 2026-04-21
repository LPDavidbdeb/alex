import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import logo from '@/assets/logo.png';
import { MapWrapper } from '@/components/Map/MapWrapper';
import type { MapProvider } from '@/components/Map/MapWrapper';
import { AddressAutocomplete } from '@/components/Search/AddressAutocomplete';
import type { AddressResult } from '@/components/Search/AddressAutocomplete';

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const [mapProvider, setMapProvider] = React.useState<MapProvider>('opensource');
  const [mapCenter, setMapCenter] = React.useState({ lat: 45.504, lng: -73.557 });

  const handleAddressSelect = (result: AddressResult) => {
    setMapCenter(result.coords);
    // On crée l'objet final pour la base de données
    const dbRecord = {
      provider: result.provider,
      data: result.raw,
      formatted_address: result.label,
      latitude: result.coords.lat,
      longitude: result.coords.lng
    };
    console.log("Enregistrement prêt pour PostgreSQL (JSONB):", dbRecord);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="RM Logistic Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">RM Logistique</h1>
          </div>
          <Button
            variant="destructive"
            onClick={logout}
          >
            Déconnexion
          </Button>
        </div>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-blue-800">
              Bienvenue, <span className="font-bold">{user?.email}</span> ! Vous êtes connecté au portail de gestion RM Logistique.
            </p>
          </CardContent>
        </Card>

        {/* Section Carte avec Autocomplete */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Suivi Géographique</CardTitle>
              <p className="text-xs text-muted-foreground">Recherchez et localisez vos expéditions au Canada</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-md border text-xs">
              <button 
                onClick={() => setMapProvider('opensource')}
                className={`px-3 py-1 rounded-sm transition-all ${mapProvider === 'opensource' ? 'bg-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                OpenSource
              </button>
              <button 
                onClick={() => setMapProvider('google')}
                className={`px-3 py-1 rounded-sm transition-all ${mapProvider === 'google' ? 'bg-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Google
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressAutocomplete 
              provider={mapProvider} 
              onAddressSelect={handleAddressSelect} 
            />
            <MapWrapper provider={mapProvider} center={mapCenter} />
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Note: Basculez entre les moteurs de rendu pour comparer les solutions.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Expéditions Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Livraisons du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Demandes de soumission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
