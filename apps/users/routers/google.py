from ninja import Router
from apps.users.services.google_service import GoogleService
from apps.users.schemas.google import GoogleStatusSchema, UsageMetricsSchema
from ninja_jwt.authentication import JWTAuth

router = Router(tags=["Google Services"], auth=JWTAuth())

@router.get("/status", response=GoogleStatusSchema)
def get_google_status(request):
    service = GoogleService()
    return service.verify_key()

@router.get("/metrics", response=UsageMetricsSchema)
def get_google_metrics(request):
    service = GoogleService()
    return service.get_usage_metrics()
