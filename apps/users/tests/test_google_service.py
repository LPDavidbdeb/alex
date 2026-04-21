import pytest
from unittest.mock import patch, MagicMock
from apps.users.services.google_service import GoogleService

@pytest.mark.django_db
class TestGoogleService:
    @patch('google.genai.Client')
    def test_verify_key_success(self, mock_client_class):
        # Mocking the client instance and models.list()
        mock_client = MagicMock()
        mock_model = MagicMock()
        mock_model.name = 'models/gemini-1.5-flash'
        mock_model.supported_actions = ['generateContent']
        mock_client.models.list.return_value = [mock_model]
        mock_client_class.return_value = mock_client
        
        service = GoogleService(api_key="fake-key")
        result = service.verify_key()
        
        assert result['status'] == 'success'
        assert any(m['id'] == 'gemini-1.5-flash' for m in result['models'])
        mock_client_class.assert_called_once_with(api_key="fake-key")

    @patch('google.genai.Client')
    def test_verify_key_failure(self, mock_client_class):
        # Mocking the client instance and an exception in models.list()
        mock_client = MagicMock()
        mock_client.models.list.side_effect = Exception("API Key not valid")
        mock_client_class.return_value = mock_client
        
        service = GoogleService(api_key="invalid-key")
        result = service.verify_key()
        
        assert result['status'] == 'error'
        assert 'API Key not valid' in result['message']
