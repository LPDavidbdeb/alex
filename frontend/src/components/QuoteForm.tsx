import React, { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { CheckCircle2, Loader2, Box, ShieldAlert, ThermometerSnowflake, Globe } from 'lucide-react';
import { quotesApi, type EquipmentType } from '@/api/quotes';
import { AddressAutocomplete, type AddressResult } from './Search/AddressAutocomplete';
import { CountrySelector } from './Search/CountrySelector';
import { MapWrapper } from '@/components/Map/MapWrapper';
import apiClient from '@/api/client';

interface RouteData {
    geometry: [number, number][];
    distance: number;
    duration: number;
}

const INCOTERMS = [
    { value: 'EXW', label: 'EXW - Ex Works' },
    { value: 'FOB', label: 'FOB - Free On Board' },
    { value: 'CIF', label: 'CIF - Cost, Insurance and Freight' },
    { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
    { value: 'DAP', label: 'DAP - Delivered At Place' },
];

export const QuoteForm: React.FC = () => {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    equipment_type_ids: [] as number[],
    is_multi_drop: false,
    pickup_date: '',
    delivery_date: '',
    incoterm: '',
    product: {
        product_type: '',
        value: 0,
        is_perishable: false,
        is_dangerous: false,
        hs_code: '',
        weight_kg: 0,
        volume_m3: 0
    },
    special_instructions: '',
    agreed_to_terms: false
  });

  const [pickupCountry, setPickupCountry] = useState('CA');
  const [dropCountry, setDropCountry] = useState('CA');
  const [pickUpAddress, setPickUpAddress] = useState<AddressResult | null>(null);
  const [finalDropAddress, setFinalDropAddress] = useState<AddressResult | null>(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await quotesApi.getEquipmentTypes();
        setEquipmentTypes(types);
      } catch (error) {
        console.error("Erreur chargement types équipement:", error);
      }
    };
    loadTypes();
  }, []);

  const calculateRoute = useCallback(async (start: {lat: number, lng: number}, end: {lat: number, lng: number}) => {
    try {
        const response = await apiClient.post('/logistics/calculate-route', { start, end }) as RouteData;
        if (response.geometry) {
            const formatted = response.geometry.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
            setRouteData({ ...response, geometry: formatted });
        }
    } catch (error) {
        console.error("Erreur calcul itinéraire:", error);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (pickUpAddress && finalDropAddress) {
        const trigger = async () => {
            await calculateRoute(
                { lat: Number(pickUpAddress.latitude), lng: Number(pickUpAddress.longitude) },
                { lat: Number(finalDropAddress.latitude), lng: Number(finalDropAddress.longitude) }
            );
        };
        if (active) trigger();
    }
    return () => { active = false; };
  }, [pickUpAddress, finalDropAddress, calculateRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickUpAddress || !finalDropAddress) return alert("Adresses manquantes.");
    setStatus('loading');
    try {
      await quotesApi.submitQuote({ ...formData, pick_up_address: pickUpAddress, final_drop_address: finalDropAddress });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <Card className="max-w-2xl mx-auto border-green-200 bg-green-50 shadow-lg">
        <CardContent className="py-12 text-center space-y-4 text-slate-800">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-green-900 uppercase">Demande reçue !</h2>
          <Button variant="outline" onClick={() => setStatus('idle')}>Envoyer une autre demande</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-2xl border-slate-200 overflow-hidden text-slate-800">
      <CardHeader className="bg-slate-900 text-white pb-8">
        <CardTitle className="text-2xl font-black uppercase tracking-tight">Demander une soumission</CardTitle>
        <CardDescription className="text-slate-400">Précision et expertise logistique internationale.</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b pb-2">Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>Prénom</Label><Input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} /></div>
                <div className="space-y-1"><Label>Nom</Label><Input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} /></div>
                <div className="space-y-1"><Label>Courriel</Label><Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                <div className="space-y-1"><Label>Téléphone</Label><Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                <div className="space-y-1 md:col-span-2">
                    <Label>Nom de l'entreprise (Optionnel)</Label>
                    <Input placeholder="ex: Costco, 9999-9999 Québec Inc..." className="bg-slate-50 border-slate-200" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
                </div>
                </div>

          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b pb-2 flex items-center gap-2"><Box className="h-3 w-3" /> Marchandise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 md:col-span-2">
                    <Label>Type de produit</Label>
                    <Input required value={formData.product.product_type} onChange={e => setFormData({...formData, product: {...formData.product, product_type: e.target.value}})} />
                </div>
                <div className="space-y-1"><Label>Valeur (CAD)</Label><Input type="number" value={formData.product.value} onChange={e => setFormData({...formData, product: {...formData.product, value: parseFloat(e.target.value)}})} /></div>
                <div className="space-y-1"><Label>Code HS</Label><Input value={formData.product.hs_code} onChange={e => setFormData({...formData, product: {...formData.product, hs_code: e.target.value}})} /></div>
                <div className="space-y-1"><Label>Poids (kg)</Label><Input type="number" value={formData.product.weight_kg} onChange={e => setFormData({...formData, product: {...formData.product, weight_kg: parseFloat(e.target.value)}})} /></div>
                <div className="space-y-1"><Label>Volume (m3)</Label><Input type="number" value={formData.product.volume_m3} onChange={e => setFormData({...formData, product: {...formData.product, volume_m3: parseFloat(e.target.value)}})} /></div>
            </div>
            <div className="flex gap-4">
                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${formData.product.is_perishable ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white opacity-50'}`}>
                    <ThermometerSnowflake className="h-4 w-4" /><input type="checkbox" className="hidden" checked={formData.product.is_perishable} onChange={e => setFormData({...formData, product: {...formData.product, is_perishable: e.target.checked}})} />
                    <span className="text-[10px] font-bold uppercase">Périssable</span>
                </label>
                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${formData.product.is_dangerous ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white opacity-50'}`}>
                    <ShieldAlert className="h-4 w-4" /><input type="checkbox" className="hidden" checked={formData.product.is_dangerous} onChange={e => setFormData({...formData, product: {...formData.product, is_dangerous: e.target.checked}})} />
                    <span className="text-[10px] font-bold uppercase">HazMat</span>
                </label>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b pb-2 flex items-center gap-2"><Globe className="h-3 w-3" /> Logistique</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Ramassage */}
                <div className="space-y-4">
                    <CountrySelector value={pickupCountry} onChange={setPickupCountry} label="Pays de départ" />
                    <div className="space-y-1">
                        <Label>Adresse de ramassage</Label>
                        <AddressAutocomplete onAddressSelect={setPickUpAddress} country={pickupCountry} />
                    </div>
                </div>

                {/* Livraison */}
                <div className="space-y-4">
                    <CountrySelector value={dropCountry} onChange={setDropCountry} label="Pays de destination" />
                    <div className="space-y-1">
                        <Label>Adresse de livraison</Label>
                        <AddressAutocomplete onAddressSelect={setFinalDropAddress} country={dropCountry} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1"><Label>Incoterm</Label><select className="w-full h-10 px-3 rounded-md border bg-slate-50 text-sm" value={formData.incoterm} onChange={e => setFormData({...formData, incoterm: e.target.value})}><option value="">Select...</option>{INCOTERMS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}</select></div>
                <div className="space-y-1"><Label>Multi-arrêts ?</Label><div className="flex gap-4 h-10 items-center"><label className="flex items-center gap-2"><input type="radio" checked={formData.is_multi_drop} onChange={() => setFormData({...formData, is_multi_drop: true})} /> Oui</label><label className="flex items-center gap-2"><input type="radio" checked={!formData.is_multi_drop} onChange={() => setFormData({...formData, is_multi_drop: false})} /> Non</label></div></div>
                <div className="space-y-1"><Label>Date ramassage</Label><Input type="date" value={formData.pickup_date} onChange={e => setFormData({...formData, pickup_date: e.target.value})} /></div>
                <div className="space-y-1"><Label>Date livraison</Label><Input type="date" value={formData.delivery_date} onChange={e => setFormData({...formData, delivery_date: e.target.value})} /></div>
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border h-[250px] shadow-inner">
            <MapWrapper provider="opensource" origin={pickUpAddress ? { lat: Number(pickUpAddress.latitude), lng: Number(pickUpAddress.longitude) } : undefined} destination={finalDropAddress ? { lat: Number(finalDropAddress.latitude), lng: Number(finalDropAddress.longitude) } : undefined} routeGeometry={routeData?.geometry} />
            {routeData && <div className="absolute top-2 right-2 bg-white/90 p-2 rounded shadow border text-[10px] font-bold">{routeData.distance} km | {routeData.duration} min</div>}
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b pb-2">Équipement requis</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
               {equipmentTypes.map(type => (
                 <label key={type.id} className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-[10px] font-bold uppercase ${formData.equipment_type_ids.includes(type.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white opacity-60'}`}>
                   <input type="checkbox" className="hidden" checked={formData.equipment_type_ids.includes(type.id)} onChange={() => {
                     const current = formData.equipment_type_ids;
                     setFormData({...formData, equipment_type_ids: current.includes(type.id) ? current.filter(i => i !== type.id) : [...current, type.id]});
                   }} /> {type.label_fr}
                 </label>
               ))}
            </div>
          </div>

          <div className="pt-6 border-t">
            <Button type="submit" className="w-full h-14 text-lg font-black bg-indigo-600 hover:bg-indigo-700 shadow-lg uppercase tracking-widest text-white" disabled={status === 'loading'}>
              {status === 'loading' ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Soumettre ma demande'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
