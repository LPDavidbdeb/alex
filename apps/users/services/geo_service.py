import os
import googlemaps
from geopy.geocoders import Nominatim
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class GeoProvider(ABC):
    """Interface de base pour les services de géocodage."""
    @abstractmethod
    def geocode(self, address: str) -> Optional[Dict[str, Any]]:
        pass

class GoogleGeoProvider(GeoProvider):
    """Implémentation utilisant Google Maps API."""
    def __init__(self, api_key: str):
        self.client = googlemaps.Client(key=api_key)

    def geocode(self, address: str) -> Optional[Dict[str, Any]]:
        try:
            result = self.client.geocode(address)
            if not result:
                return None
            location = result[0]['geometry']['location']
            return {
                "lat": location['lat'],
                "lng": location['lng'],
                "address": result[0]['formatted_address'],
                "provider": "google"
            }
        except Exception as e:
            print(f"Erreur Google Geocode: {e}")
            return None

class OpenSourceGeoProvider(GeoProvider):
    """Implémentation utilisant Nominatim (OpenStreetMap)."""
    def __init__(self):
        # user_agent est requis par les conditions d'utilisation de Nominatim
        self.geolocator = Nominatim(user_agent="rm_logistique_app")

    def geocode(self, address: str) -> Optional[Dict[str, Any]]:
        try:
            location = self.geolocator.geocode(address)
            if not location:
                return None
            return {
                "lat": location.latitude,
                "lng": location.longitude,
                "address": location.address,
                "provider": "osm"
            }
        except Exception as e:
            print(f"Erreur OSM Geocode: {e}")
            return None

class GeoService:
    """Service principal qui orchestre le choix du provider."""
    def __init__(self):
        # Par défaut, on utilise l'open source pour économiser les coûts
        self.provider_name = os.getenv('GEO_PROVIDER', 'opensource').lower()
        
        if self.provider_name == 'google':
            api_key = os.getenv('GOOGLE_MAP_JAVASCRIPT_API_KEY')
            if not api_key:
                print("Attention: GOOGLE_MAP_JAVASCRIPT_API_KEY non configurée. Fallback sur OpenSource.")
                self.provider = OpenSourceGeoProvider()
                self.provider_name = 'opensource'
            else:
                self.provider = GoogleGeoProvider(api_key)
        else:
            self.provider = OpenSourceGeoProvider()

    def get_coordinates(self, address: str) -> Optional[Dict[str, Any]]:
        """Méthode unifiée pour obtenir des coordonnées à partir d'une adresse."""
        return self.provider.geocode(address)
