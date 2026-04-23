import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { quotesApi, type QuoteRequest } from '@/api/quotes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageSquare,
  AlertCircle,
  Loader2,
  Truck,
  Calendar,
  History,
  ChevronRight,
  Map as MapIcon,
  Navigation,
  Clock,
  ExternalLink,
  MapPin,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MapWrapper } from '@/components/Map/MapWrapper';
import { QuoteAnalysisView } from '@/components/QuoteAnalysisView';
import { EditableProductCard } from '@/components/EditableProductCard';
import { CreateQuoteModal } from '@/components/CreateQuoteModal';
import { AddressAutocomplete } from '@/components/Search/AddressAutocomplete';
import apiClient from '@/api/client';

interface RouteData {
    geometry: [number, number][];
    distance: number;
    duration: number;
}

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [history, setHistory] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateRoute = useCallback(async (start: {lat: number, lng: number}, end: {lat: number, lng: number}, quoteId: number) => {
    setIsCalculating(true);
    try {
        const response = await apiClient.post('/logistics/calculate-route', { start, end }) as RouteData;
        if (response.geometry && Array.isArray(response.geometry)) {
            const formattedGeometry = response.geometry.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
            setRouteData({
                geometry: formattedGeometry,
                distance: response.distance_km,
                duration: response.duration_min
            });
            await quotesApi.updateMetrics(quoteId, response.distance_km, response.duration_min);
        }
    } catch (error) {
        console.error("Erreur calcul itinéraire:", error);
    } finally {
        setIsCalculating(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const context = await quotesApi.get(parseInt(id));
      setQuote(context.quote);
      setHistory(context.client_history);
      
      if (context.quote.pick_up_address && context.quote.final_drop_address) {
          calculateRoute(
              { lat: Number(context.quote.pick_up_address.latitude), lng: Number(context.quote.pick_up_address.longitude) },
              { lat: Number(context.quote.final_drop_address.latitude), lng: Number(context.quote.final_drop_address.longitude) },
              context.quote.id
          );
      }
    } catch (error) {
      console.error("Erreur récupération dossier:", error);
    } finally {
      setLoading(false);
    }
  }, [id, calculateRoute]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isProductComplete = (q: QuoteRequest) => {
      return q.product && q.product.product_type !== "Non spécifié" && (q.product.weight_kg || 0) > 0;
  };

  if (loading && !quote) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto p-4 md:p-8">
        {/* CONDENSED HEADER */}
        <div className="bg-white border rounded-xl p-4 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/quotes')} className="h-10 w-10 p-0 border rounded-full">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-black uppercase tracking-tight">{quote.first_name} {quote.last_name}</h1>
                        {quote.client?.unit_name && (
                            <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest">
                                {quote.client.unit_name}
                                {quote.client.banner_name && ` (${quote.client.banner_name})`}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1">
                        <a href={`mailto:${quote.email}`} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors font-medium">
                            <Mail className="h-3 w-3" /> {quote.email}
                        </a>
                        <a href={`tel:${quote.phone}`} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors font-medium">
                            <Phone className="h-3 w-3" /> {quote.phone}
                        </a>
                        {quote.client?.unit_address && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-indigo-400" /> 
                                {quote.client.unit_address.label}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="font-bold text-xs h-10 px-4 border-slate-200 text-slate-600">
                    <ExternalLink className="h-3.5 w-3.5 mr-2" /> PORTAIL CLIENT
                </Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-black text-xs h-10 px-6 shadow-lg shadow-indigo-100 uppercase tracking-widest text-white">
                    CONVERTIR EN ORDRE
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start text-slate-800">
          
          {/* COLUMN 1: History */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Historique</h3>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsModalOpen(true)}
                    className="h-6 px-2 text-[9px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all"
                >
                    + NOUVELLE
                </Button>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                {history.map((h) => (
                    <Link key={h.id} to={`/quotes/${h.id}`}>
                        <div className={`p-4 rounded-xl border transition-all hover:shadow-md ${h.id === quote.id ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-sm' : 'bg-white/50 border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-bold text-slate-400">{new Date(h.created_at).toLocaleDateString()}</span>
                                {h.id === quote.id && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
                            </div>
                            <div className="text-[11px] font-bold text-slate-800 truncate mb-1 uppercase tracking-tight">{h.pick_up_address.label.split(',')[0]}</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <ChevronRight className="h-2 w-2 text-indigo-400" />
                                <span className="truncate">{h.final_drop_address.label.split(',')[0]}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>

          {/* COLUMN 2 & 3: Main Details */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-sm border-slate-200 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3 px-6 text-slate-600">
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-indigo-600" />
                    <CardTitle className="text-xs font-black uppercase tracking-widest">Détails du transport</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex flex-col items-center gap-1 mt-1">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <div className="w-0.5 h-12 bg-slate-100" />
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                        </div>
                        <div className="flex-1 space-y-6">
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Origine</p>
                                <p className="text-sm font-bold leading-tight">{quote.pick_up_address.label}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Destination</p>
                                <p className="text-sm font-bold leading-tight">{quote.final_drop_address.label}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t pt-6">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <Navigation className="h-3.5 w-3.5 mx-auto mb-1.5 text-indigo-600" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Distance</p>
                        <p className="text-sm font-black text-slate-900">{routeData?.distance || quote.estimated_distance_km || '--'} <span className="text-[10px] font-normal">km</span></p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <Clock className="h-3.5 w-3.5 mx-auto mb-1.5 text-indigo-600" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Temps Est.</p>
                        <p className="text-sm font-black text-slate-900">{routeData?.duration || quote.estimated_duration_min || '--'} <span className="text-[10px] font-normal">min</span></p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <Calendar className="h-3.5 w-3.5 mx-auto mb-1.5 text-indigo-600" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Planification</p>
                        <p className="text-[10px] font-black text-slate-700">{quote.pickup_date ? new Date(quote.pickup_date).toLocaleDateString() : 'ASAP'}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <AlertCircle className="h-3.5 w-3.5 mx-auto mb-1.5 text-indigo-600" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Incoterm</p>
                        <p className="text-sm font-black text-slate-900">{quote.incoterm || 'N/A'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                   <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b pb-1">Équipement</p>
                      <div className="flex flex-wrap gap-1">
                        {quote.equipment_types.length > 0 ? quote.equipment_types.map(et => (
                          <span key={et.id} className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 uppercase">
                            {et.label_fr}
                          </span>
                        )) : (
                          <span className="text-[10px] text-slate-400 italic">Aucun</span>
                        )}
                      </div>
                   </div>
                   <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Config</p>
                      <p className="text-sm font-bold text-slate-700">{quote.is_multi_drop ? 'Multi-arrêts (Oui)' : 'Direct'}</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            <EditableProductCard product={quote.product!} />

            {!isProductComplete(quote) ? (
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="py-8 text-center space-y-3">
                        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                        <h3 className="text-sm font-bold text-amber-900 uppercase">Analyse IA Suspendue</h3>
                        <p className="text-xs text-amber-700 max-w-sm mx-auto">Veuillez compléter le <strong>Type de produit</strong> et le <strong>Poids</strong> pour activer l'analyse.</p>
                    </CardContent>
                </Card>
            ) : (
                <QuoteAnalysisView quoteId={quote.id} />
            )}

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="py-3 px-6 border-b bg-white text-slate-400">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Instructions Spéciales
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 italic text-sm text-slate-600 bg-slate-50/50">
                {quote.special_instructions || "Aucune consigne particulière."}
              </CardContent>
            </Card>
          </div>

          {/* COLUMN 4: Map (Right Sidebar) */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 px-1 text-slate-800">
                <MapIcon className="h-4 w-4 text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Localisation</h3>
            </div>
            <Card className="overflow-hidden shadow-xl border-slate-200 ring-1 ring-black/5">
                <div className="relative h-[300px] bg-slate-100">
                    <MapWrapper 
                        provider="opensource" 
                        origin={{ lat: Number(quote.pick_up_address.latitude), lng: Number(quote.pick_up_address.longitude) }} 
                        destination={{ lat: Number(quote.final_drop_address.latitude), lng: Number(quote.final_drop_address.longitude) }} 
                        routeGeometry={routeData?.geometry}
                    />
                    {isCalculating && <div className="absolute inset-0 z-[1001] bg-white/40 backdrop-blur-[1px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}
                </div>
            </Card>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-6 shadow-sm">
                <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-1">
                        <Building className="h-3 w-3" /> Adresse de l'unité
                    </p>
                    <AddressAutocomplete 
                        onAddressSelect={async (addr) => {
                            if (quote.client?.id) {
                                await quotesApi.updateCompanyAddress(quote.client.id, addr);
                                fetchData();
                            }
                        }}
                        placeholder={quote.client?.unit_address?.label || "Définir l'adresse..."}
                    />
                </div>
                
                <div className="h-px bg-slate-100" />
                
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Dernière MAJ</span>
                    <span>{new Date(quote.created_at).toLocaleTimeString()}</span>
                </div>
                
                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 border-slate-200 hover:bg-slate-50">
                    Générer Rapport PDF
                </Button>
            </div>
          </div>

        </div>
      </main>

      {isModalOpen && quote && (
        <CreateQuoteModal 
            clientInfo={{ first_name: quote.first_name, last_name: quote.last_name, email: quote.email, phone: quote.phone }}
            onSuccess={() => { setIsModalOpen(false); navigate('/quotes'); }}
            onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default QuoteDetail;
