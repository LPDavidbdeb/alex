from ninja import Schema
from typing import List

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
