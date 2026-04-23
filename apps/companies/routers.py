from ninja import Router
from django.shortcuts import get_object_or_404
from django.http import Http404
from apps.addresses.models import Address
from apps.addresses.schemas import AddressSchema
from .models import Company
from ninja_jwt.authentication import JWTAuth
from django.contrib.auth import get_user_model

User = get_user_model()
router = Router(tags=["Companies"], auth=JWTAuth())

@router.patch("/update-address/{user_id}")
def update_company_address(request, user_id: int, data: AddressSchema):
    """
    Met à jour l'adresse de l'unité rattachée.
    Sécurité: Staff uniquement ou l'utilisateur lui-même.
    """
    target_user = get_object_or_404(User, id=user_id)
    
    # Règle de sécurité
    is_self = request.user.id == target_user.id
    if not (request.user.is_staff or is_self):
        return router.api.create_response(request, {"detail": "Non autorisé"}, status=403)

    if not target_user.company:
        return {"error": "L'utilisateur n'est pas lié à une entreprise"}
    
    # Création de l'objet adresse
    new_address = Address.objects.create(
        label=data.label,
        latitude=data.latitude,
        longitude=data.longitude,
        source=data.source,
        raw_json=data.raw_json
    )
    
    # Liaison à la compagnie
    target_user.company.default_address = new_address
    target_user.company.save()
    
    return {"status": "success", "label": new_address.label}
