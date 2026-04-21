import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import type { MapProvider } from '../Map/MapWrapper';

export interface AddressResult {
  value: string;
  label: string;
  coords: { lat: number; lng: number };
  raw: unknown; 
  provider: MapProvider;
}

interface AddressAutocompleteProps {
  provider: MapProvider;
  onAddressSelect: (result: AddressResult) => void;
}

interface PhotonFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: {
    name?: string;
    house_number?: string;
    street?: string;
    city?: string;
    postcode?: string;
    state?: string;
    countrycode?: string;
  };
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  provider, 
  onAddressSelect 
}) => {
  const [inputValue, setInputValue] = useState('');

  const loadOptions = (
    searchValue: string,
    callback: (options: AddressResult[]) => void
  ) => {
    if (!searchValue || searchValue.length < 3) {
        callback([]);
        return;
    }

    if (provider === 'google') {
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
      // Priorisation Canada (lon: -106, lat: 56) et langue française
      // On ajoute un filtre par pays pour plus de précision : &location_bias=...
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchValue)}&limit=10&lang=fr&lat=45.5&lon=-73.5`;
      
      fetch(url)
        .then(response => response.json())
        .then(data => {
          const options = data.features.map((feature: PhotonFeature) => {
            const { properties, geometry } = feature;
            
            // On privilégie les résultats canadiens
            if (properties.countrycode !== 'CA' && searchValue.length < 10) {
                // On garde quand même, mais le biais lat/lon aide à les mettre en haut
            }

            const labelParts = [
                properties.name,
                properties.house_number ? properties.house_number : null,
                properties.street,
                properties.city,
                properties.postcode,
                properties.state,
                "Canada"
            ].filter(Boolean);
            
            const label = Array.from(new Set(labelParts)).join(', ');

            return {
              value: `osm-${geometry.coordinates[1]}`,
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
        placeholder="Rechercher une adresse au Canada..."
        noOptionsMessage={() => "Aucun résultat"}
        loadingMessage={() => "Recherche..."}
        onChange={(option: AddressResult | null) => {
            if (option) {
                onAddressSelect(option);
                setInputValue('');
            }
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '45px',
            borderRadius: '8px',
            borderColor: '#cbd5e1',
            boxShadow: 'none'
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
        isClearable
      />
    </div>
  );
};
