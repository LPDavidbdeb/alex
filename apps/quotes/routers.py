from typing import List
from ninja import Router
from django.shortcuts import get_object_or_404
from .models import QuoteRequest, EquipmentType
from .schemas import (
    QuoteRequestIn, QuoteRequestOut, EquipmentTypeOut, 
    QuoteDetailContextOut, QuoteMetricsIn
)
from .services import QuoteService
from ninja_jwt.authentication import JWTAuth

router = Router(tags=["Quotes"])
service = QuoteService()

@router.get("/equipment-types", response=List[EquipmentTypeOut])
def list_equipment_types(request):
    return EquipmentType.objects.all()

@router.post("/", response={200: dict})
def create_quote_request(request, data: QuoteRequestIn):
    quote = service.create_quote(data.dict())
    return {"status": "success", "uuid": str(quote.uuid)}

@router.get("/list", response=List[QuoteRequestOut], auth=JWTAuth())
def list_quotes(request):
    return service.list_all()

@router.get("/{quote_id}", response=QuoteDetailContextOut, auth=JWTAuth())
def get_quote(request, quote_id: int):
    """Récupère une soumission avec le contexte historique du client."""
    return service.get_with_context(quote_id)

@router.patch("/{quote_id}/metrics", auth=JWTAuth())
def update_quote_metrics(request, quote_id: int, data: QuoteMetricsIn):
    """Mise à jour silencieuse des métriques de trajet."""
    quote = get_object_or_404(QuoteRequest, id=quote_id)
    if data.estimated_distance_km is not None:
        quote.estimated_distance_km = data.estimated_distance_km
    if data.estimated_duration_min is not None:
        quote.estimated_duration_min = data.estimated_duration_min
    quote.save()
    return {"status": "success"}
