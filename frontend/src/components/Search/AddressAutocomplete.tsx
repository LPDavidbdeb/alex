import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import apiClient from '@/api/client';

export interface AddressResult {
  label: string;
  latitude: number;
  longitude: number;
  source: string;
  raw_json: Record<string, unknown>;
  country_ref_id?: number | null;
}

interface AddressOption {
  value: string;
  label: string;
  data: AddressResult;
}

interface AddressAutocompleteProps {
  onAddressSelect: (result: AddressResult) => void;
  placeholder?: string;
  provider?: string;
  country?: string; // Facultatif : filtre le pays
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  onAddressSelect,
  placeholder = "Rechercher une adresse...",
  country
}) => {
  const [inputValue, setInputValue] = useState('');

  const loadOptions = (
    searchValue: string,
    callback: (options: AddressOption[]) => void
  ) => {
    if (!searchValue || searchValue.length < 3) {
        callback([]);
        return;
    }

    // On passe le pays si sélectionné pour aider le moteur de recherche
    const url = `/addresses/search?q=${encodeURIComponent(searchValue)}${country ? `&country=${encodeURIComponent(country)}` : ''}`;

    apiClient.get(url)
      .then((results: unknown) => {
        const res = results as AddressResult[];
        const options = res.map((r: AddressResult) => ({
          value: `${r.latitude}-${r.longitude}`,
          label: r.label,
          data: r
        }));
        callback(options);
      })
      .catch(error => {
        console.error("Erreur recherche adresse:", error);
        callback([]);
      });
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    return newValue;
  };

  return (
    <div className="w-full relative" style={{ zIndex: 1001 }}>
      <AsyncSelect<AddressOption>
        cacheOptions
        loadOptions={loadOptions}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        placeholder={placeholder}
        noOptionsMessage={() => "Aucun résultat"}
        loadingMessage={() => "Recherche..."}
        onChange={(option: AddressOption | null) => {
            if (option) {
                onAddressSelect(option.data);
                setInputValue('');
            }
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '45px',
            borderRadius: '8px',
            borderColor: '#cbd5e1',
            boxShadow: 'none',
            fontSize: '14px'
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
        isClearable
      />
    </div>
  );
};
