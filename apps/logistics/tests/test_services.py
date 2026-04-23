import pytest
import os
from unittest.mock import patch, MagicMock
from apps.logistics.services import OSRMProvider, GoogleRoutingProvider, RoutingService

class TestRoutingProviders:
    def test_osrm_success(self):
        provider = OSRMProvider()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "routes": [{"geometry": {"coordinates": [[0,0], [1,1]]}, "distance": 1000, "duration": 60}]
        }
        with patch('requests.get', return_value=mock_resp):
            res = provider.calculate_route({"lat": 0, "lng": 0}, {"lat": 1, "lng": 1})
            assert res["distance_km"] == 1.0
            assert res["duration_min"] == 1.0

    def test_osrm_failure_non_200(self):
        provider = OSRMProvider()
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        with patch('requests.get', return_value=mock_resp):
            res = provider.calculate_route({"lat": 0, "lng": 0}, {"lat": 1, "lng": 1})
            assert res is None

    def test_osrm_exception(self):
        """Vérifie le repli en cas d'exception OSRM."""
        provider = OSRMProvider()
        with patch('requests.get', side_effect=Exception("OSRM down")):
            res = provider.calculate_route({"lat": 0, "lng": 0}, {"lat": 1, "lng": 1})
            assert res is None

    @patch('googlemaps.Client')
    def test_google_success(self, mock_client):
        provider = GoogleRoutingProvider(api_key="AIzaFake")
        provider.client.directions = MagicMock(return_value=[{
            "overview_polyline": {"points": "xyz"},
            "legs": [{"distance": {"value": 2000}, "duration": {"value": 120}}]
        }])
        res = provider.calculate_route({"lat": 0, "lng": 0}, {"lat": 1, "lng": 1})
        assert res["distance_km"] == 2.0
        assert res["duration_min"] == 2.0

    @patch('googlemaps.Client')
    def test_google_empty_results(self, mock_client):
        """Vérifie le retour None si Google ne trouve pas de trajet."""
        provider = GoogleRoutingProvider(api_key="AIzaFake")
        provider.client.directions = MagicMock(return_value=[])
        res = provider.calculate_route({"lat": 0, "lng": 0}, {"lat": 1, "lng": 1})
        assert res is None

    @patch('googlemaps.Client')
    def test_google_exception(self, mock_client):
        """Vérifie le repli en cas d'exception Google API."""
        provider = GoogleRoutingProvider(api_key="AIzaFake")
        provider.client.directions = MagicMock(side_effect=Exception("API Error"))
        res = provider.calculate_route({"lat": 0, "lng": 0}, {"lat": 1, "lng": 1})
        assert res is None

    def test_routing_service_default_osrm(self):
        with patch.dict('os.environ', {'ROUTING_PROVIDER': 'opensource'}):
            service = RoutingService()
            assert isinstance(service.provider, OSRMProvider)

    def test_routing_service_google(self):
        with patch.dict('os.environ', {
            'ROUTING_PROVIDER': 'google',
            'GOOGLE_MAP_JAVASCRIPT_API_KEY': 'AIzaSomeKey'
        }):
            service = RoutingService()
            assert isinstance(service.provider, GoogleRoutingProvider)
