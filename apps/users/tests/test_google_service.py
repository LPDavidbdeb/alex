import pytest
import os
from unittest.mock import patch, MagicMock
from apps.users.services.google_service import GoogleService

@pytest.mark.django_db
class TestGoogleService:
    @patch('google.genai.Client')
    def test_verify_key_success(self, mock_client_class):
        mock_client = MagicMock()
        mock_model = MagicMock()
        mock_model.name = 'models/gemini-1.5-flash'
        mock_model.supported_actions = ['generateContent']
        mock_client.models.list.return_value = [mock_model]
        mock_client_class.return_value = mock_client
        
        service = GoogleService(api_key="AIzaFake")
        result = service.verify_key()
        
        assert result['status'] == 'success'
        assert any(m['id'] == 'gemini-1.5-flash' for m in result['models'])

    def test_verify_key_missing_key(self):
        """Vérifie le comportement si aucune clé n'est fournie."""
        service = GoogleService(api_key=None)
        # On force la réinitialisation si settings est chargé
        service.api_key = None
        service.client = None
        result = service.verify_key()
        assert result['status'] == 'error'
        assert "manquante" in result['message']

    @patch('google.genai.Client')
    def test_verify_key_unsupported_model(self, mock_client_class):
        """Vérifie qu'on ignore les modèles qui ne supportent pas generateContent."""
        mock_client = MagicMock()
        mock_model = MagicMock()
        mock_model.name = 'models/secret-model'
        mock_model.supported_actions = ['otherAction']
        mock_client.models.list.return_value = [mock_model]
        mock_client_class.return_value = mock_client
        
        service = GoogleService(api_key="AIzaFake")
        result = service.verify_key()
        assert result['status'] == 'success'
        assert len(result['models']) == 0

    @patch('google.genai.Client')
    def test_get_usage_metrics_no_project(self, mock_client_class):
        """Vérifie le message d'info si le PROJECT_NUMBER est manquant."""
        service = GoogleService(api_key="AIzaFake", project_number=None)
        # On force l'absence si injecté par settings
        service.project_number = None
        result = service.get_usage_metrics()
        assert result['status'] == 'info'
        assert "manquant" in result['message']

    @patch('google.cloud.monitoring_v3.MetricServiceClient')
    def test_get_usage_metrics_generic_exception(self, mock_metric_client):
        """Vérifie la capture d'exception générique lors du fetch des métriques."""
        with patch.dict(os.environ, {'GOOGLE_PROJECT_NUMBER': '123'}):
            mock_metric_client.return_value.list_time_series.side_effect = Exception("Cloud Error")
            service = GoogleService(api_key="AIzaFake", project_number="123")
            result = service.get_usage_metrics()
            assert result['status'] == 'error'
            assert "Cloud Error" in result['message']

    @patch('google.cloud.monitoring_v3.MetricServiceClient')
    def test_get_usage_metrics_billing_required(self, mock_metric_client):
        """Vérifie le status warning si le billing n'est pas activé sur le projet Google."""
        with patch.dict(os.environ, {'GOOGLE_PROJECT_NUMBER': '123'}):
            mock_metric_client.return_value.list_time_series.side_effect = Exception("Cloud Monitoring API has not been used... or billing to be enabled")
            service = GoogleService(api_key="AIzaFake", project_number="123")
            result = service.get_usage_metrics()
            assert result['status'] == 'warning'
            assert "Billing" in result['message']
