import os
import requests
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List

class RoutingProvider(ABC):
    @abstractmethod
    def calculate_route(self, start_coords: Dict[str, float], end_coords: Dict[str, float]) -> Optional[Dict[str, Any]]:
        pass

class OSRMProvider(RoutingProvider):
    """Calcul d'itinéraire gratuit via OSRM (OpenStreetMap)."""
    def __init__(self):
        self.base_url = "http://router.project-osrm.org/route/v1/driving/"

    def calculate_route(self, start_coords: Dict[str, float], end_coords: Dict[str, float]) -> Optional[Dict[str, Any]]:
        # Format OSRM: longitude,latitude
        url = f"{self.base_url}{start_coords['lng']},{start_coords['lat']};{end_coords['lng']},{end_coords['lat']}"
        params = {
            "overview": "full",
            "geometries": "geojson",
            "steps": "false"
        }
        
        try:
            response = requests.get(url, params=params, timeout=5)
            if response.status_code != 200:
                return None
            
            data = response.json()
            if not data.get('routes'):
                return None
            
            route = data['routes'][0]
            return {
                "distance_km": round(route['distance'] / 1000, 2),
                "duration_min": round(route['duration'] / 60, 1),
                "geometry": route['geometry']['coordinates'], # GeoJSON format: [[lng, lat], ...]
                "provider": "osrm"
            }
        except Exception as e:
            print(f"Erreur OSRM Routing: {e}")
            return None

class GoogleRoutingProvider(RoutingProvider):
    """Calcul d'itinéraire via Google Directions API."""
    def __init__(self, api_key: str):
        import googlemaps
        self.client = googlemaps.Client(key=api_key)

    def calculate_route(self, start_coords: Dict[str, float], end_coords: Dict[str, float]) -> Optional[Dict[str, Any]]:
        try:
            result = self.client.directions(
                (start_coords['lat'], start_coords['lng']),
                (end_coords['lat'], end_coords['lng']),
                mode="driving"
            )
            if not result: return None
            
            leg = result[0]['legs'][0]
            return {
                "distance_km": round(leg['distance']['value'] / 1000, 2),
                "duration_min": round(leg['duration']['value'] / 60, 1),
                "geometry": [],
                "provider": "google"
            }
        except Exception as e:
            print(f"Erreur Google Routing: {e}")
            return None

class RoutingService:
    """Orchestrateur indépendant pour le calcul de trajets."""
    def __init__(self):
        self.provider_name = os.getenv('ROUTING_PROVIDER', 'opensource').lower()
        
        if self.provider_name == 'google':
            api_key = os.getenv('GOOGLE_MAP_JAVASCRIPT_API_KEY')
            self.provider = GoogleRoutingProvider(api_key)
        else:
            self.provider = OSRMProvider()

    def get_route(self, start: Dict[str, float], end: Dict[str, float]) -> Optional[Dict[str, Any]]:
        """Calcule le trajet entre deux points (lat, lng)."""
        return self.provider.calculate_route(start, end)
