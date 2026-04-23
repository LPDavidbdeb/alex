from ninja import Router
from .schemas import RouteRequestSchema, RouteResponseSchema
from .services import RoutingService
from ninja.errors import HttpError

router = Router(tags=["Logistics"])
service = RoutingService()

@router.post("/calculate-route", response=RouteResponseSchema)
def calculate_route(request, data: RouteRequestSchema):
    """Calcule le trajet entre deux points (lat, lng). Accessible au public."""
    print(f"DEBUG - Calculation Request:")
    print(f"  START: Lat={data.start.lat}, Lng={data.start.lng}")
    print(f"  END:   Lat={data.end.lat}, Lng={data.end.lng}")
    
    start = {"lat": data.start.lat, "lng": data.start.lng}
    end = {"lat": data.end.lat, "lng": data.end.lng}
    
    result = service.get_route(start, end)
    if not result:
        raise HttpError(400, "Impossible de calculer l'itinéraire.")
        
    return result
