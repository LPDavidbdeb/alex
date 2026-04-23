import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import Client
from django.contrib.auth import get_user_model
from apps.quotes.models import QuoteRequest
from apps.addresses.models import Address
from apps.analytics.models import QuoteAnalysis

User = get_user_model()

@pytest.mark.django_db
class TestAnalyticsAPI:
    @pytest.fixture
    def setup_data(self):
        self.user = User.objects.create_superuser(email="analyst_api@test.com", password="pass")
        self.pickup = Address.objects.create(label="A", latitude=0, longitude=0, source="X", raw_json={})
        self.drop = Address.objects.create(label="B", latitude=0, longitude=0, source="X", raw_json={})
        self.quote = QuoteRequest.objects.create(
            client=self.user, first_name="A", last_name="B", email="analyst_api@test.com",
            phone="123", pick_up_address=self.pickup, final_drop_address=self.drop, agreed_to_terms=True
        )
        
        # Obtenir le token
        client = Client()
        login_resp = client.post(
            "/api/auth/token",
            data=json.dumps({"email": "analyst_api@test.com", "password": "pass"}),
            content_type="application/json"
        )
        self.token = login_resp.json()['access']
        self.headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    @patch('apps.analytics.services.LogisticsAnalystService._call_gemini')
    def test_trigger_analysis_endpoint(self, mock_call_gemini, setup_data):
        """Vérifie que l'IA est appelée et que le résultat est stocké via l'API."""
        client = Client()
        
        # Mock Data renvoyée par Gemini
        mock_ai_json = {
            "scenarios": [{"name": "Test Scenario", "estimated_total_cost": 1000, "transit_time": "1 day", "pros": [], "cons": [], "risk_score": 1}],
            "global_analysis": "Analyse de test",
            "recommendation": "Go"
        }
        mock_call_gemini.return_value = mock_ai_json
        
        response = client.post(
            f"/api/analytics/{self.quote.id}/analyze",
            **self.headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["full_response"]["recommendation"] == "Go"
        assert QuoteAnalysis.objects.filter(quote=self.quote).exists()

    def test_get_existing_analysis_endpoint(self, setup_data):
        """Vérifie la récupération d'une analyse existante."""
        client = Client()
        # On crée manuellement une analyse
        QuoteAnalysis.objects.create(
            quote=self.quote,
            full_response={"recommendation": "Already analyzed"},
            model_version="test-model"
        )
        
        response = client.get(
            f"/api/analytics/{self.quote.id}",
            **self.headers
        )
        
        assert response.status_code == 200
        assert response.json()["full_response"]["recommendation"] == "Already analyzed"

@pytest.mark.django_db
def test_analysis_str():
    from apps.addresses.models import Address
    addr = Address.objects.create(label="A", latitude=0, longitude=0, source="X", raw_json={})
    quote = QuoteRequest.objects.create(first_name="A", last_name="B", email="a@a.com", pick_up_address=addr, final_drop_address=addr)
    analysis = QuoteAnalysis(quote=quote)
    assert str(quote.uuid) in str(analysis)
