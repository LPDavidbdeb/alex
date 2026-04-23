from ninja_extra import NinjaExtraAPI
from apps.users.routers.auth import auth_router
from apps.users.routers.google import router as google_router
from apps.addresses.routers import router as addresses_router
from apps.quotes.routers import router as quotes_router
from apps.logistics.routers import router as logistics_router
from apps.analytics.routers import router as analytics_router
from apps.products.routers import router as products_router
from apps.companies.routers import router as companies_router

api = NinjaExtraAPI(
    title="RM Logistic API",
    version="1.1.0",
    description="API modulaire pour RM Logistique"
)

# Enregistrement des routers (Unifiés et Modulaires)
api.add_router("/auth", auth_router)
api.add_router("/google", google_router)
api.add_router("/addresses", addresses_router)
api.add_router("/quotes", quotes_router)
api.add_router("/logistics", logistics_router)
api.add_router("/analytics", analytics_router)
api.add_router("/products", products_router)
api.add_router("/companies", companies_router)
