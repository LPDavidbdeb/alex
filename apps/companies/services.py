from typing import Optional
from .models import Company
from django.contrib.auth import get_user_model

User = get_user_model()

class CompanyService:
    """Service gérant la logique métier des entreprises."""

    def get_or_create_for_client(self, user: User, company_name: Optional[str] = None) -> Company:
        """
        Associe un utilisateur à une entreprise. 
        """
        if user.company:
            return user.company

        if company_name:
            # Normalisation basique pour éviter les doublons par casse ou espaces
            clean_name = company_name.strip()
            company, _ = Company.objects.get_or_create(
                name__iexact=clean_name,
                defaults={'name': clean_name, 'company_type': 'INDEPENDENT', 'is_synthetic': False}
            )
        else:
            # Création d'une entité synthétique (individuelle)
            company = Company.objects.create(
                name=f"{user.first_name} {user.last_name} Inc.",
                company_type='INDEPENDENT',
                is_synthetic=True
            )

        user.company = company
        user.save()
        
        return company
