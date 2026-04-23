import pytest
import json
from django.test import Client
from django.contrib.auth import get_user_model
from apps.quotes.models import EquipmentType, QuoteRequest
from apps.addresses.models import Address

User = get_user_model()

@pytest.mark.django_db
class TestQuotesAPI:
    @pytest.fixture
    def setup_auth(self):
        self.user = User.objects.create_superuser(email="prod_api@test.com", password="pass")
        client = Client()
        login_resp = client.post(
            "/api/auth/token",
            data=json.dumps({"email": "prod_api@test.com", "password": "pass"}),
            content_type="application/json"
        )
        self.token = login_resp.json()['access']
        self.headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_list_equipment_types_endpoint(self):
        """Vérifie la récupération de la liste des types d'équipement."""
        EquipmentType.objects.create(name="Dry Van", label_fr="Dry Van")
        client = Client()
        response = client.get("/api/quotes/equipment-types")
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_create_quote_request_endpoint(self):
        """Vérifie la soumission publique d'un devis via l'API."""
        client = Client()
        payload = {
            "first_name": "API",
            "last_name": "Tester",
            "email": "api@tester.com",
            "phone": "514-111-2222",
            "equipment_type_ids": [],
            "pick_up_address": {
                "label": "Start", "latitude": 45.0, "longitude": -73.0, "source": "OSM", "raw_json": {}, "country_ref_id": None
            },
            "final_drop_address": {
                "label": "End", "latitude": 46.0, "longitude": -74.0, "source": "OSM", "raw_json": {}, "country_ref_id": None
            },
            "is_multi_drop": False,
            "agreed_to_terms": True
        }
        
        response = client.post(
            "/api/quotes/",
            data=json.dumps(payload),
            content_type="application/json"
        )
        assert response.status_code == 200
        assert "uuid" in response.json()

    def test_list_quotes_authenticated(self, setup_auth):
        """Vérifie que la liste privée est accessible aux employés authentifiés."""
        client = Client()
        response = client.get(
            "/api/quotes/list",
            **self.headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_quote_detail_context_authenticated(self, setup_auth):
        """Vérifie que le détail renvoie bien le format contextuel {quote, client_history}."""
        # Création d'un devis pour avoir de la donnée
        pickup = Address.objects.create(label="A", latitude=0, longitude=0, source="X", raw_json={})
        drop = Address.objects.create(label="B", latitude=0, longitude=0, source="X", raw_json={})
        quote = QuoteRequest.objects.create(
            client=self.user, first_name="A", last_name="B", email="prod_api@test.com",
            phone="123", pick_up_address=pickup, final_drop_address=drop, agreed_to_terms=True
        )

        client = Client()
        response = client.get(
            f"/api/quotes/{quote.id}",
            **self.headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "quote" in data
        assert "client_history" in data
        assert data["quote"]["id"] == quote.id

    def test_update_quote_metrics_success(self, setup_auth):
        """Vérifie la mise à jour réussie des métriques."""
        from apps.products.models import Product
        addr = Address.objects.create(label="Test", latitude=0, longitude=0, source="X", raw_json={})
        prod = Product.objects.create(product_type="Test")
        quote = QuoteRequest.objects.create(
            first_name="T", last_name="T", email="t@t.com", 
            pick_up_address=addr, final_drop_address=addr, product=prod
        )
        client = Client()
        payload = {"estimated_distance_km": 150.5, "estimated_duration_min": 120}
        response = client.patch(
            f"/api/quotes/{quote.id}/metrics",
            data=json.dumps(payload),
            content_type="application/json",
            **self.headers
        )
        assert response.status_code == 200
        quote.refresh_from_db()
        assert float(quote.estimated_distance_km) == 150.5
        assert quote.estimated_duration_min == 120

    def test_update_quote_metrics_not_found(self, setup_auth):
        """Vérifie le retour 404 si le devis n'existe pas."""
        client = Client()
        response = client.patch(
            "/api/quotes/9999/metrics",
            data=json.dumps({"estimated_distance_km": 10}),
            content_type="application/json",
            **self.headers
        )
        assert response.status_code == 404
