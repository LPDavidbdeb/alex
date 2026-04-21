from ninja import Schema
from typing import Any, Dict, List

class AddressSaveSchema(Schema):
    """Schéma pour la sauvegarde d'une adresse avec sa source (provider)."""
    provider: str  # 'google' ou 'opensource'
    formatted_address: str
    latitude: float
    longitude: float
    data: Dict[str, Any]  # L'objet JSON brut provenant du provider

class CoordinatesSchema(Schema):
    lat: float
    lng: float

class RouteRequestSchema(Schema):
    start: CoordinatesSchema
    end: CoordinatesSchema

class RouteResponseSchema(Schema):
    distance_km: float
    duration_min: float
    geometry: List[List[float]] # GeoJSON [[lng, lat], ...]
    provider: str
