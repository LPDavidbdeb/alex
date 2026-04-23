import pytest
import json
from django.test import Client
from django.contrib.auth import get_user_model
from apps.companies.models import Company
from apps.addresses.models import Address

User = get_user_model()

@pytest.mark.django_db
class TestCompaniesAPI:
    @pytest.fixture
    def setup_auth(self):
        self.user = User.objects.create_superuser(email="comp_api@test.com", password="pass")
        client = Client()
        login_resp = client.post(
            "/api/auth/token",
            data=json.dumps({"email": "comp_api@test.com", "password": "pass"}),
            content_type="application/json"
        )
        self.token = login_resp.json()['access']
        self.headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_update_company_address_no_company(self, setup_auth):
        """Vérifie l'erreur si l'utilisateur n'a pas de compagnie."""
        client = Client()
        payload = {
            "label": "Test", "latitude": 0, "longitude": 0, "source": "X", "raw_json": {}
        }
        response = client.patch(
            f"/api/companies/update-address/{self.user.id}",
            data=json.dumps(payload),
            content_type="application/json",
            **self.headers
        )
        assert response.status_code == 200 # L'API retourne un dict avec error
        assert "error" in response.json()

    def test_update_company_address_success(self, setup_auth):
        """Vérifie la mise à jour réussie de l'adresse de l'unité."""
        company = Company.objects.create(name="Unit Test")
        self.user.company = company
        self.user.save()
        
        client = Client()
        payload = {
            "label": "123 Business St", "latitude": 45.0, "longitude": -73.0, "source": "OSM", "raw_json": {"city": "Mtl"}
        }
        response = client.patch(
            f"/api/companies/update-address/{self.user.id}",
            data=json.dumps(payload),
            content_type="application/json",
            **self.headers
        )
        
        assert response.status_code == 200
        assert response.json()["status"] == "success"
        
        company.refresh_from_db()
        assert company.default_address.label == "123 Business St"
