import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Box, Loader2, ThermometerSnowflake, ShieldAlert } from 'lucide-react';
import { productsApi } from '@/api/products';
import type { Product } from '@/api/quotes';

interface Props {
  product: Product;
}

export const EditableProductCard: React.FC<Props> = ({ product: initialProduct }) => {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const lastSavedRef = useRef<string>(JSON.stringify(initialProduct));

  const handleUpdateField = (field: keyof Product, value: string | number | boolean) => {
    setProduct(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    const currentData = JSON.stringify(product);
    if (currentData === lastSavedRef.current) return;

    setIsSaving(true);
    try {
      const { id, ...payload } = product;
      if (id) {
        const updated = await productsApi.update(id, payload as Product);
        lastSavedRef.current = JSON.stringify(updated);
        setHasChanges(false);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du produit:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card 
        className={`shadow-md transition-all border-l-4 ${hasChanges ? 'border-l-amber-500' : 'border-l-indigo-600'}`}
        onMouseLeave={saveChanges}
    >
      <CardHeader className="border-b bg-white py-3 flex flex-row items-center justify-between text-slate-800">
        <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-indigo-600" />
            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Détails du Produit</CardTitle>
        </div>
        {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin text-indigo-600" />
        ) : hasChanges ? (
            <span className="text-[9px] font-black text-amber-600 animate-pulse uppercase">Modifications en cours...</span>
        ) : (
            <CheckCircleIcon className="h-3 w-3 text-green-500" />
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">Type</label>
                <input 
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border-none rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={product.product_type}
                    onChange={(e) => handleUpdateField('product_type', e.target.value)}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">Valeur (CAD)</label>
                <input 
                    type="number"
                    className="w-full text-xs font-bold text-green-600 bg-slate-50 border-none rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={product.value || 0}
                    onChange={(e) => handleUpdateField('value', parseFloat(e.target.value))}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">Poids (kg)</label>
                <input 
                    type="number"
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border-none rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={product.weight_kg || 0}
                    onChange={(e) => handleUpdateField('weight_kg', parseFloat(e.target.value))}
                />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">Volume (m³)</label>
                <input 
                    type="number"
                    className="w-full text-xs font-bold text-slate-700 bg-slate-50 border-none rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                    value={product.volume_m3 || 0}
                    onChange={(e) => handleUpdateField('volume_m3', parseFloat(e.target.value))}
                />
            </div>
        </div>

        <div className="flex gap-4 border-t pt-4">
            <label className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer border transition-all ${product.is_dangerous ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-100 opacity-50'}`}>
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase">HazMat</span>
                <input type="checkbox" className="hidden" checked={product.is_dangerous} onChange={(e) => handleUpdateField('is_dangerous', e.target.checked)} />
            </label>
            <label className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer border transition-all ${product.is_perishable ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-100 opacity-50'}`}>
                <ThermometerSnowflake className="h-3.5 w-3.5" />
                <span className="text-[9px] font-black uppercase">Périssable</span>
                <input type="checkbox" className="hidden" checked={product.is_perishable} onChange={(e) => handleUpdateField('is_perishable', e.target.checked)} />
            </label>
        </div>

        <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase">Code HS</label>
            <input 
                className="w-full text-[10px] font-mono text-slate-500 bg-slate-50 border-none rounded p-1 focus:ring-1 focus:ring-indigo-500 outline-none uppercase"
                value={product.hs_code || ''}
                placeholder="N/A"
                onChange={(e) => handleUpdateField('hs_code', e.target.value)}
            />
        </div>
      </CardContent>
    </Card>
  );
};

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
);
