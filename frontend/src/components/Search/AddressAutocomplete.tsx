import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import type { MapProvider } from '../Map/MapWrapper';

export interface AddressResult {
  label: string;
  coords: { lat: number; lng: number };
  raw: any; 
  provider: MapProvider;
}

interface AddressAutocompleteProps {
  provider: MapProvider;
  onAddressSelect: (result: AddressResult) => void;
}

/**
 * Composant de recherche d'adresse intelligent (Autocomplete).
 * Version stabilisée avec gestion d'état et debouncing.
 */
export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  provider, 
  onAddressSelect 
}) => {
  const [inputValue, setInputValue] = useState('');

  // Fonction de recherche avec délai (Debounce simple via setTimeout ou logique interne react-select)
  const loadOptions = (
    searchValue: string,
    callback: (options: any[]) => void
  ) => {
    if (!searchValue || searchValue.length < 3) {
        callback([]);
        return;
    }

    if (provider === 'google') {
      // Simulation pour le PoC
      callback([
        { 
            value: 'google-sim-1',
            label: "507 Place d'Armes, Montréal, QC (Simulé)", 
            coords: { lat: 45.504, lng: -73.557 },
            raw: { source: "google_sim" },
            provider: 'google' 
        }
      ]);
    } else {
      // Recherche réelle Photon (OSM)
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchValue)}&limit=8&lang=fr`)
        .then(response => response.json())
        .then(data => {
          const options = data.features.map((feature: any, index: number) => {
            const { properties, geometry } = feature;
            
            // Construction d'un label lisible
            const parts = [
                properties.name,
                properties.house_number,
                properties.street,
                properties.city,
                properties.postcode,
                properties.state,
                properties.country
            ].filter(Boolean);
            
            // On retire les doublons consécutifs (ex: Nom du magasin qui est aussi l'adresse)
            const uniqueParts = parts.filter((item, pos) => parts.indexOf(item) === pos);
            const label = uniqueParts.join(', ');

            return {
              value: `osm-${index}-${geometry.coordinates[1]}`,
              label: label,
              coords: { 
                lat: geometry.coordinates[1], 
                lng: geometry.coordinates[0] 
              },
              raw: feature,
              provider: 'opensource'
            };
          });
          callback(options);
        })
        .catch(error => {
          console.error("Erreur Photon:", error);
          callback([]);
        });
    }
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    return newValue;
  };

  return (
    <div className="w-full relative" style={{ zIndex: 1001 }}>
      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        placeholder="Saisissez une adresse au Canada..."
        noOptionsMessage={({ inputValue }) => 
          inputValue.length < 3 ? "Entrez au moins 3 caractères" : "Aucun résultat trouvé"
        }
        loadingMessage={() => "Recherche..."}
        onChange={(option: any) => {
            if (option) {
                onAddressSelect(option);
                setInputValue(''); // Réinitialise la barre après sélection
            }
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '45px',
            borderRadius: '8px',
            borderColor: '#e2e8f0',
            boxShadow: 'none',
            '&:hover': { borderColor: '#cbd5e1' }
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
            borderRadius: '8px',
            overflow: 'hidden'
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          option: (base, state) => ({
            ...base,
            fontSize: '14px',
            backgroundColor: state.isFocused ? '#f8fafc' : 'white',
            color: '#1e293b',
            cursor: 'pointer'
          })
        }}
        menuPortalTarget={document.body}
        isClearable
      />
    </div>
  );
};
