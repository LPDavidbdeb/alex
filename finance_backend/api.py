from ninja_extra import NinjaExtraAPI
from apps.users.routers.auth import auth_router
from apps.users.routers.logistics import logistics_router

api = NinjaExtraAPI(
    title="Alex Finance API",
    version="1.0.0",
    description="API pour la gestion de finances personnelles"
)

# Enregistrement des routers
api.add_router("/auth", auth_router)
api.add_router("/logistics", logistics_router)
