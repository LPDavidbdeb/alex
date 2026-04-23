from typing import List, Optional
from ninja import Router
from .schemas import AddressSchema, CountryOut
from .services import AddressService
from .models import Country

router = Router(tags=["Addresses"])
service = AddressService()

@router.get("/countries", response=List[CountryOut])
def list_countries(request):
    """Liste tous les pays actifs pour le référentiel."""
    return Country.objects.filter(is_active=True)

@router.get("/search", response=List[AddressSchema])
def search_address(request, q: str, country: Optional[str] = None):
    """
    Recherche d'adresse avec filtre par code ISO2.
    """
    return service.search(q, country_code=country)
