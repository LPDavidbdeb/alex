from typing import Dict, Any, List
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from apps.addresses.models import Address
from apps.products.models import Product
from apps.companies.services import CompanyService
from .models import QuoteRequest, EquipmentType
from django.shortcuts import get_object_or_404

User = get_user_model()

class QuoteService:
    """The 'Brain' for quote and lead management."""
    
    def __init__(self):
        self.company_service = CompanyService()

    def create_quote(self, data: Dict[str, Any]) -> QuoteRequest:
        # 1. User/Client Management
        email = data.get('email')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        client_user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": first_name,
                "last_name": last_name,
                "is_active": True
            }
        )
        if created:
            client_user.set_unusable_password()
            client_user.save()
            group, _ = Group.objects.get_or_create(name='Client')
            client_user.groups.add(group)

        # 1.1 Company Management
        company_name = data.get('company_name')
        company = self.company_service.get_or_create_for_client(client_user, company_name)

        # 2. Address Creation
        pickup_data = data.get('pick_up_address')
        drop_data = data.get('final_drop_address')
        pickup_address = Address.objects.create(**pickup_data)
        drop_address = Address.objects.create(**drop_data)

        # 3. Product Creation
        product_data = data.get('product')
        if not product_data:
            product = Product.objects.create(product_type="Non spécifié", weight_kg=0, volume_m3=0)
        else:
            product = Product.objects.create(**product_data)

        # 4. Quote Creation (Explicit linking to client_company)
        equipment_ids = data.get('equipment_type_ids', [])
        
        quote = QuoteRequest.objects.create(
            client=client_user,
            client_company=company,
            product=product,
            incoterm=data.get('incoterm'),
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=data.get('phone'),
            pick_up_address=pickup_address,
            final_drop_address=drop_address,
            is_multi_drop=data.get('is_multi_drop', False),
            pickup_date=data.get('pickup_date'),
            delivery_date=data.get('delivery_date'),
            special_instructions=data.get('special_instructions'),
            agreed_to_terms=data.get('agreed_to_terms', False)
        )
        
        if equipment_ids:
            quote.equipment_types.set(equipment_ids)
            
        return quote

    def list_all(self) -> List[QuoteRequest]:
        return QuoteRequest.objects.all().order_by('-created_at')

    def get_with_context(self, quote_id: int) -> Dict[str, Any]:
        """Récupère une soumission ET l'historique complet du client associé."""
        quote = get_object_or_404(QuoteRequest, id=quote_id)
        client_history = QuoteRequest.objects.filter(client=quote.client).order_by('-created_at')
        return {
            "quote": quote,
            "client_history": client_history
        }

    def get_by_id(self, quote_id: int) -> QuoteRequest:
        return get_object_or_404(QuoteRequest, id=quote_id)
