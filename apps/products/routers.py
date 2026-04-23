from ninja import Router
from django.shortcuts import get_object_or_404
from .models import Product
from .schemas import ProductIn, ProductOut
from ninja_jwt.authentication import JWTAuth

router = Router(tags=["Products"], auth=JWTAuth())

@router.put("/{product_id}", response=ProductOut)
def update_product(request, product_id: int, data: ProductIn):
    """Mise à jour complète d'un produit (Remplacement de l'objet)."""
    product = get_object_or_404(Product, id=product_id)
    
    # On écrase l'ensemble des champs avec les données reçues
    # pour garantir l'intégrité de l'objet complet.
    for attr, value in data.dict().items():
        setattr(product, attr, value)
        
    product.save()
    return product
