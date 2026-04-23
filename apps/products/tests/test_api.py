import pytest
import json
from django.test import Client
from django.contrib.auth import get_user_model
from apps.products.models import Product

User = get_user_model()

@pytest.mark.django_db
class TestProductsAPI:
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

    def test_update_product_full_replacement(self, setup_auth):
        """Vérifie que PUT remplace bien l'objet au complet."""
        product = Product.objects.create(
            product_type="Initial", weight_kg=10.0, is_dangerous=True
        )
        client = Client()
        
        # Nouvelles données (on change tout)
        payload = {
            "product_type": "Updated",
            "value": 500.00,
            "is_perishable": True,
            "is_dangerous": False, # On change le boolean
            "weight_kg": 25.5,
            "volume_m3": 1.2
        }
        
        response = client.put(
            f"/api/products/{product.id}",
            data=json.dumps(payload),
            content_type="application/json",
            **self.headers
        )
        
        assert response.status_code == 200
        product.refresh_from_db()
        assert product.product_type == "Updated"
        assert product.is_dangerous is False
        assert product.is_perishable is True
        assert float(product.weight_kg) == 25.5

    def test_update_product_not_found(self, setup_auth):
        """Vérifie le retour 404 si le produit n'existe pas."""
        client = Client()
        payload = {
            "product_type": "None", "is_perishable": False, "is_dangerous": False
        }
        response = client.put(
            "/api/products/9999",
            data=json.dumps(payload),
            content_type="application/json",
            **self.headers
        )
        assert response.status_code == 404

@pytest.mark.django_db
def test_product_str():
    p = Product(product_type="Steel", weight_kg=500.5)
    assert str(p) == "Steel (500.5 kg)"
