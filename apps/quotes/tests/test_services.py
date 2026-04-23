import pytest
from apps.quotes.services import QuoteService
from apps.quotes.models import QuoteRequest, EquipmentType
from apps.addresses.models import Address
from apps.products.models import Product
from apps.companies.models import Company
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestQuoteService:
    @pytest.fixture
    def service(self):
        return QuoteService()

    @pytest.fixture
    def addresses(self):
        pickup = Address.objects.create(label="Start", latitude=0, longitude=0, source="X", raw_json={})
        drop = Address.objects.create(label="End", latitude=0, longitude=0, source="X", raw_json={})
        return pickup, drop

    def test_create_quote_existing_user_and_company(self, service, addresses):
        """Vérifie le rattachement à un utilisateur et une entreprise existants."""
        company = Company.objects.create(name="Existing Co")
        user = User.objects.create(email="old@test.com", first_name="A", last_name="B", company=company)
        
        data = {
            "first_name": "A", "last_name": "B", "email": "old@test.com", "phone": "123",
            "company_name": "Existing Co",
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        }
        
        quote = service.create_quote(data)
        assert quote.client == user
        assert user.company == company

    def test_create_quote_with_equipment_types(self, service, addresses):
        """Vérifie la liaison Many-to-Many des types d'équipement."""
        et1 = EquipmentType.objects.create(name="ET1", label_fr="ET1")
        et2 = EquipmentType.objects.create(name="ET2", label_fr="ET2")
        
        data = {
            "first_name": "E", "last_name": "Q", "email": "eq@test.com", "phone": "123",
            "equipment_type_ids": [et1.id, et2.id],
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        }
        
        quote = service.create_quote(data)
        assert quote.equipment_types.count() == 2
        assert et1 in quote.equipment_types.all()

    def test_list_all_ordering(self, service, addresses):
        """Vérifie que la liste est triée par date de création décroissante."""
        q1 = service.create_quote({
            "first_name": "Q1", "last_name": "T", "email": "q1@t.com", "phone": "1",
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        })
        q2 = service.create_quote({
            "first_name": "Q2", "last_name": "T", "email": "q2@t.com", "phone": "2",
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        })
        
        results = service.list_all()
        assert list(results) == [q2, q1]

    def test_get_with_context_sorting(self, service, addresses):
        """Vérifie que l'historique client est trié du plus récent au plus ancien."""
        user = User.objects.create(email="hist@test.com", first_name="H", last_name="T")
        q1 = service.create_quote({
            "first_name": "H", "last_name": "T", "email": "hist@test.com", "phone": "1",
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        })
        q2 = service.create_quote({
            "first_name": "H", "last_name": "T", "email": "hist@test.com", "phone": "2",
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        })
        
        context = service.get_with_context(q1.id)
        assert list(context["client_history"]) == [q2, q1]

    def test_get_by_id_success(self, service, addresses):
        """Vérifie la récupération d'un devis par son ID."""
        q = service.create_quote({
            "first_name": "Find", "last_name": "Me", "email": "find@t.com", "phone": "1",
            "pick_up_address": {"label": "A", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "final_drop_address": {"label": "B", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}},
            "agreed_to_terms": True
        })
        found = service.get_by_id(q.id)
        assert found.id == q.id

    def test_get_by_id_not_found(self, service):
        """Vérifie le lever d'exception 404 si l'ID n'existe pas."""
        from django.http import Http404
        with pytest.raises(Http404):
            service.get_by_id(9999)
