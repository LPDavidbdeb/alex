from ninja import Router
from .services import LogisticsAnalystService
from .schemas import QuoteAnalysisOut
from .models import QuoteAnalysis
from ninja_jwt.authentication import JWTAuth
from django.shortcuts import get_object_or_404

router = Router(tags=["AI Analytics"], auth=JWTAuth())
service = LogisticsAnalystService()

@router.post("/{quote_id}/analyze", response=QuoteAnalysisOut)
def trigger_analysis(request, quote_id: int):
    """Déclenche une nouvelle analyse stratégique par l'IA."""
    return service.analyze_quote(quote_id)

@router.get("/{quote_id}", response=QuoteAnalysisOut)
def get_existing_analysis(request, quote_id: int):
    """Récupère l'analyse existante pour un devis."""
    return get_object_or_404(QuoteAnalysis, quote_id=quote_id)
