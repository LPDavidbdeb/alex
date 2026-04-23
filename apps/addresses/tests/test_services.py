import pytest
from unittest.mock import patch, MagicMock
from apps.addresses.services import AddressService

class TestAddressServiceMocked:
    @pytest.fixture
    def service(self):
        return AddressService()

    def test_search_success_mocked(self, service):
        """Vérifie le succès de recherche avec un mock Photon."""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "features": [{
                "properties": {"name": "Test Place", "city": "Mtl", "country": "Canada"},
                "geometry": {"coordinates": [-73, 45]}
            }]
        }
        with patch('requests.get', return_value=mock_resp):
            results = service.search("Test")
            assert len(results) == 1
            assert results[0]['label'] == "Test Place, Mtl, Canada"

    def test_search_exception_returns_empty_list(self, service):
        """Vérifie qu'une exception réseau retourne une liste vide sans planter."""
        with patch('requests.get', side_effect=Exception("Network Down")):
            results = service.search("Test")
            assert results == []
