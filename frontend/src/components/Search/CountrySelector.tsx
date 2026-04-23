import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { addressesApi, type Country } from '@/api/addresses';

interface Props {
  value: string; // ISO2 code
  onChange: (countryCode: string) => void;
  label?: string;
}

export const CountrySelector: React.FC<Props> = ({ value, onChange, label }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await addressesApi.getCountries();
        setCountries(data);
      } catch (error) {
        console.error("Erreur chargement pays:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  const options = countries.map(c => ({
    value: c.iso2,
    label: c.name
  }));

  // On cherche l'option correspondant à la valeur, sinon on ne met rien par défaut 
  // (la valeur initiale du parent pilotera le choix)
  const selectedOption = options.find(o => o.value === value) || null;

  return (
    <div className="space-y-1">
      {label && <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</label>}
      <Select
        options={options}
        value={selectedOption}
        isLoading={loading}
        placeholder={loading ? "Chargement..." : "Sélectionner un pays..."}
        onChange={(opt) => opt && onChange(opt.value)}
        className="text-xs font-bold"
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '40px',
            borderRadius: '8px',
            borderColor: '#e2e8f0',
            boxShadow: 'none',
          }),
        }}
      />
    </div>
  );
};
