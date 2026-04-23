import pytest
import json
from unittest.mock import patch, MagicMock
from apps.analytics.services import LogisticsAnalystService
from apps.analytics.models import QuoteAnalysis
from apps.quotes.models import QuoteRequest
from apps.addresses.models import Address
from apps.products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestLogisticsAnalystService:
    @pytest.fixture
    def setup_quote(self):
        user = User.objects.create_user(email="analyst@test.com", password="pass")
        pickup = Address.objects.create(label="A", latitude=45.0, longitude=-73.0, source="X", raw_json={})
        drop = Address.objects.create(label="B", latitude=46.0, longitude=-74.0, source="X", raw_json={})
        product = Product.objects.create(product_type="Electronics", weight_kg=100)
        
        quote = QuoteRequest.objects.create(
            client=user,
            first_name="Test",
            last_name="AI",
            email="analyst@test.com",
            phone="123",
            pick_up_address=pickup,
            final_drop_address=drop,
            product=product,
            agreed_to_terms=True
        )
        return quote

    @patch('google.genai.Client')
    def test_generate_and_save_analysis_success(self, mock_client_class, setup_quote):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"scenarios": [{"name": "Eco", "cost": 500}], "recommendation": "Use Eco"}'
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        service = LogisticsAnalystService()
        analysis = service.analyze_quote(setup_quote.id)
        
        assert isinstance(analysis, QuoteAnalysis)
        assert analysis.full_response["recommendation"] == "Use Eco"
        assert QuoteAnalysis.objects.count() == 1

    @patch('google.genai.Client')
    def test_analyze_quote_without_product(self, mock_client_class, setup_quote):
        """Vérifie que l'analyse fonctionne même si le produit est manquant (fallback)."""
        setup_quote.product = None
        setup_quote.save()
        
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"scenarios": [], "recommendation": "No product"}'
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        service = LogisticsAnalystService()
        analysis = service.analyze_quote(setup_quote.id)
        assert analysis.full_response["recommendation"] == "No product"

    @patch('google.genai.Client')
    def test_analyze_quote_invalid_json_fallback(self, mock_client_class, setup_quote):
        """Vérifie le fallback en cas de JSON invalide renvoyé par Gemini."""
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Texte brut non JSON"
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        service = LogisticsAnalystService()
        analysis = service.analyze_quote(setup_quote.id)
        
        # Le service doit retourner un dictionnaire avec l'erreur
        assert "error" in analysis.full_response
        assert "raw_output" in analysis.full_response

    @patch('google.genai.Client')
    def test_analyze_quote_updates_existing(self, mock_client_class, setup_quote):
        """Vérifie qu'on écrase une analyse existante au lieu d'en créer une nouvelle."""
        QuoteAnalysis.objects.create(quote=setup_quote, full_response={"old": True})
        
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = '{"new": "data"}'
        mock_client.models.generate_content.return_value = mock_response
        mock_client_class.return_value = mock_client
        
        service = LogisticsAnalystService()
        service.analyze_quote(setup_quote.id)
        
        assert QuoteAnalysis.objects.count() == 1
        assert QuoteAnalysis.objects.first().full_response == {"new": "data"}
