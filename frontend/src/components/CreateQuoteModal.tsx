import React, { useState } from 'react';
import { quotesApi, type AddressResult } from '@/api/quotes';
import { AddressAutocomplete } from './Search/AddressAutocomplete';
import { CountrySelector } from './Search/CountrySelector';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent } from './ui/Card';
import { X, Loader2, PlusCircle, Box, FileSignature, ThermometerSnowflake, ShieldAlert, Globe } from 'lucide-react';

interface Props {
  clientInfo: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  onSuccess: () => void;
  onClose: () => void;
}

const INCOTERMS = [
    { value: 'EXW', label: 'EXW - Ex Works' },
    { value: 'FOB', label: 'FOB - Free On Board' },
    { value: 'CIF', label: 'CIF - Cost, Insurance and Freight' },
    { value: 'DDP', label: 'DDP - Delivered Duty Paid' },
    { value: 'DAP', label: 'DAP - Delivered At Place' },
];

export const CreateQuoteModal: React.FC<Props> = ({ clientInfo, onSuccess, onClose }) => {
  const [pickUpAddress, setPickUpAddress] = useState<AddressResult | null>(null);
  const [finalDropAddress, setFinalDropAddress] = useState<AddressResult | null>(null);
  const [pickupCountry, setPickupCountry] = useState('CA');
  const [dropCountry, setDropCountry] = useState('CA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showOptional, setShowOptional] = useState(false);
  const [formData, setFormData] = useState({
    incoterm: '',
    product: {
        product_type: '',
        value: 0,
        is_perishable: false,
        is_dangerous: false,
        hs_code: '',
        weight_kg: 0,
        volume_m3: 0
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickUpAddress || !finalDropAddress) {
        alert("Le départ et l'arrivée sont obligatoires.");
        return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...clientInfo,
        ...formData,
        pick_up_address: pickUpAddress,
        final_drop_address: finalDropAddress,
        equipment_type_ids: [],
        is_multi_drop: false,
        agreed_to_terms: true
      };
      await quotesApi.submitQuote(payload);
      onSuccess();
    } catch (error) {
      console.error("Erreur création devis:", error);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto text-slate-800">
      <Card className="w-full max-w-2xl shadow-2xl border-none overflow-hidden my-auto">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
                <PlusCircle className="h-6 w-6 text-indigo-200" />
                <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Nouvelle Soumission</h2>
                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Client: {clientInfo.first_name} {clientInfo.last_name}</p>
                </div>
            </div>
            <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X className="h-5 w-5" />
            </button>
        </div>
        
        <CardContent className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-10">
                {/* OBLIGATORY SECTION */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 border-b pb-2 flex items-center gap-2"><Globe className="h-3 w-3" /> Itinéraire</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Pickup */}
                        <div className="space-y-4">
                            <CountrySelector value={pickupCountry} onChange={setPickupCountry} label="Pays de départ" />
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-green-700">Adresse de ramassage</Label>
                                <AddressAutocomplete onAddressSelect={setPickUpAddress} country={pickupCountry} />
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="space-y-4">
                            <CountrySelector value={dropCountry} onChange={setDropCountry} label="Pays de destination" />
                            <div className="space-y-1">
                                <Label className="text-[10px] font-bold text-red-700">Adresse de livraison</Label>
                                <AddressAutocomplete onAddressSelect={setFinalDropAddress} country={dropCountry} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* OPTIONAL TOGGLE */}
                <div className="pt-2">
                    <button 
                        type="button"
                        onClick={() => setShowOptional(!showOptional)}
                        className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                        {showOptional ? "- MASQUER LES DÉTAILS OPTIONNELS" : "+ AJOUTER PRODUIT ET INCOTERM (OPTIONNEL)"}
                    </button>
                </div>

                {showOptional && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                        {/* Product Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2 flex items-center gap-2">
                                <Box className="h-3 w-3" /> Informations Marchandise
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 space-y-1">
                                    <Label className="text-[10px]">Type de produit</Label>
                                    <Input placeholder="ex: Machinerie lourde" value={formData.product.product_type} onChange={e => setFormData({...formData, product: {...formData.product, product_type: e.target.value}})} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Poids (kg)</Label>
                                    <Input type="number" value={formData.product.weight_kg} onChange={e => setFormData({...formData, product: {...formData.product, weight_kg: parseFloat(e.target.value)}})} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Volume (m³)</Label>
                                    <Input type="number" value={formData.product.volume_m3} onChange={e => setFormData({...formData, product: {...formData.product, volume_m3: parseFloat(e.target.value)}})} />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${formData.product.is_perishable ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white opacity-50'}`}>
                                    <ThermometerSnowflake className="h-3.5 w-3.5" /><input type="checkbox" className="hidden" checked={formData.product.is_perishable} onChange={e => setFormData({...formData, product: {...formData.product, is_perishable: e.target.checked}})} />
                                    <span className="text-[9px] font-black uppercase">Périssable</span>
                                </label>
                                <label className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${formData.product.is_dangerous ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white opacity-50'}`}>
                                    <ShieldAlert className="h-3.5 w-3.5" /><input type="checkbox" className="hidden" checked={formData.product.is_dangerous} onChange={e => setFormData({...formData, product: {...formData.product, is_dangerous: e.target.checked}})} />
                                    <span className="text-[9px] font-black uppercase">HazMat</span>
                                </label>
                            </div>
                        </div>

                        {/* Terms Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b pb-2 flex items-center gap-2">
                                <FileSignature className="h-3 w-3" /> Termes Commerciaux
                            </h3>
                            <div className="space-y-1">
                                <Label className="text-[10px]">Incoterm</Label>
                                <select 
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={formData.incoterm}
                                    onChange={e => setFormData({...formData, incoterm: e.target.value})}
                                >
                                    <option value="">Sélectionner un terme...</option>
                                    {INCOTERMS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                    <Button type="button" variant="ghost" onClick={onClose} className="flex-1 font-bold text-slate-500">ANNULER</Button>
                    <Button type="submit" disabled={isSubmitting || !pickUpAddress || !finalDropAddress} className="flex-2 bg-indigo-600 hover:bg-indigo-700 font-black px-8 text-white">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "CRÉER LA SOUMISSION"}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};
