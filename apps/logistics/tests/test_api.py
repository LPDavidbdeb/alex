import pytest
import json
from unittest.mock import patch
from django.test import Client

@pytest.mark.django_db
class TestLogisticsAPI:
    def test_calculate_route_success(self):
        """Vérifie le succès du calcul d'itinéraire avec des coordonnées valides."""
        client = Client()
        payload = {
            "start": {"lat": 45.504, "lng": -73.557},
            "end": {"lat": 43.642, "lng": -79.387}
        }
        
        mock_response = {
            "routes": [{
                "distance": 542000,
                "duration": 19800,
                "geometry": {"coordinates": [[-73.557, 45.504], [-79.387, 43.642]]}
            }]
        }

        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = mock_response
            
            response = client.post("/api/logistics/calculate-route", data=json.dumps(payload), content_type="application/json")
            assert response.status_code == 200
            assert response.json()["distance_km"] == 542.0

    def test_calculate_route_with_strings(self):
        """Vérifie que l'API gère correctement les coordonnées envoyées sous forme de chaînes (ex: provenant de Decimal)."""
        client = Client()
        # On simule ce que Ninja reçoit parfois : des strings
        payload = {
            "start": {"lat": "45.504", "lng": "-73.557"},
            "end": {"lat": "43.642", "lng": "-79.387"}
        }
        
        mock_response = {
            "routes": [{
                "distance": 1000, "duration": 60,
                "geometry": {"coordinates": [[-73.557, 45.504], [-79.387, 43.642]]}
            }]
        }

        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = mock_response
            
            response = client.post("/api/logistics/calculate-route", data=json.dumps(payload), content_type="application/json")
            assert response.status_code == 200
            assert response.json()["distance_km"] == 1.0

    def test_calculate_route_failure(self):
        """Vérifie qu'une erreur 400 est retournée si le moteur de calcul échoue."""
        client = Client()
        payload = {
            "start": {"lat": 0.0, "lng": 0.0},
            "end": {"lat": 1.0, "lng": 1.0}
        }
        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {"routes": []}
            response = client.post("/api/logistics/calculate-route", data=json.dumps(payload), content_type="application/json")
            assert response.status_code == 400
            assert response.json()["detail"] == "Impossible de calculer l'itinéraire."
