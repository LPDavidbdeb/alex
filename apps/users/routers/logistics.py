from ninja_extra import Router
from ninja_jwt.authentication import JWTAuth
from apps.users.schemas.location import RouteRequestSchema, RouteResponseSchema
from apps.users.services.routing_service import RoutingService
from ninja.errors import HttpError

logistics_router = Router()
routing_service = RoutingService()

@logistics_router.post("/calculate-route", response=RouteResponseSchema, auth=JWTAuth())
def calculate_route(request, data: RouteRequestSchema):
    """
    Calcule un itinéraire routier réel entre deux points.
    """
    start_coords = {"lat": data.start.lat, "lng": data.start.lng}
    end_coords = {"lat": data.end.lat, "lng": data.end.lng}
    
    result = routing_service.get_route(start_coords, end_coords)
    
    if not result:
        raise HttpError(400, "Impossible de calculer l'itinéraire.")
        
    return result
