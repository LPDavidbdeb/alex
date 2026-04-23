import pytest
import json
from django.test import Client
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()

@pytest.mark.django_db
class TestGoogleAPI:
    @pytest.fixture
    def setup_auth(self):
        admin = User.objects.create_superuser(email="google_api@rm.com", password="pass")
        client = Client()
        login_resp = client.post(
            "/api/auth/token",
            data=json.dumps({"email": "google_api@rm.com", "password": "pass"}),
            content_type="application/json"
        )
        self.token = login_resp.json()['access']
        self.headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    @patch('apps.users.routers.google.GoogleService.verify_key')
    def test_get_google_status_mocked(self, mock_verify, setup_auth):
        """Vérifie l'endpoint status avec un service mocké."""
        mock_verify.return_value = {"status": "success", "message": "Mocked OK"}
        client = Client()
        response = client.get("/api/google/status", **self.headers)
        assert response.status_code == 200
        assert response.json()["status"] == "success"

    @patch('apps.users.routers.google.GoogleService.get_usage_metrics')
    def test_get_google_metrics_mocked(self, mock_metrics, setup_auth):
        """Vérifie l'endpoint metrics avec un service mocké."""
        mock_metrics.return_value = {
            "status": "success", 
            "request_count": 42, 
            "message": "Mocked OK", 
            "tracked_locally": False
        }
        client = Client()
        response = client.get("/api/google/metrics", **self.headers)
        assert response.status_code == 200
        assert response.json()["request_count"] == 42
