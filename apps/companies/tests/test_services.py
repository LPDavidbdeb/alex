import pytest
from apps.companies.services import CompanyService
from apps.companies.models import Company
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestCompanyService:
    @pytest.fixture
    def service(self):
        return CompanyService()

    def test_get_or_create_returns_existing_company(self, service):
        """Vérifie qu'on retourne la compagnie existante de l'utilisateur."""
        company = Company.objects.create(name="Existing Co")
        user = User.objects.create(email="user@test.com", first_name="A", last_name="B", company=company)
        
        result = service.get_or_create_for_client(user)
        assert result == company
        assert result.name == "Existing Co"

    def test_get_or_create_with_name_creates_new(self, service):
        """Vérifie la création d'une nouvelle compagnie via son nom."""
        user = User.objects.create(email="user2@test.com", first_name="A", last_name="B")
        
        result = service.get_or_create_for_client(user, company_name="New Branch")
        assert result.name == "New Branch"
        assert user.company == result
        assert result.company_type == 'INDEPENDENT'

    def test_get_or_create_with_name_reuses_existing(self, service):
        """Vérifie qu'on réutilise une compagnie existante avec le même nom."""
        existing = Company.objects.create(name="Same Name")
        user = User.objects.create(email="user3@test.com")
        
        result = service.get_or_create_for_client(user, company_name="Same Name")
        assert result == existing
        assert user.company == existing

    def test_get_or_create_without_name_creates_individual(self, service):
        """Vérifie la création d'une entité individuelle par défaut."""
        user = User.objects.create(email="indiv@test.com", first_name="Jean", last_name="Tremblay")
        
        result = service.get_or_create_for_client(user)
        assert result.name == "Jean Tremblay Inc."
        assert user.company == result
