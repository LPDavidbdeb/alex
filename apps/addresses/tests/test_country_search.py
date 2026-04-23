import pytest
from unittest.mock import patch, MagicMock
from apps.addresses.services import AddressService

@pytest.mark.django_db
class TestCountrySearchIntegration:
    def test_search_with_country_filter_applies_param(self):
        """Vérifie que le code pays est bien transmis à l'API Photon."""
        service = AddressService()
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {"features": []}
            
            # Recherche filtrée sur la France (FR)
            service.search(q="Place d'Armes", country_code="FR")
            
            # On vérifie que 'filter' est présent dans les params de requests
            args, kwargs = mock_get.call_args
            params = kwargs.get('params', {})
            assert "filter" in params
            assert "countrycode:fr" in params["filter"]

    def test_search_without_country_filter_is_clean(self):
        """Vérifie qu'aucun filtre n'est appliqué si le pays est omis."""
        service = AddressService()
        
        with patch('requests.get') as mock_get:
            mock_get.return_value.status_code = 200
            mock_get.return_value.json.return_value = {"features": []}
            
            service.search(q="Place d'Armes")
            
            args, kwargs = mock_get.call_args
            params = kwargs.get('params', {})
            assert "filter" not in params

    def test_label_construction_respects_api_country(self):
        """Vérifie que le label utilise le pays réel de l'API et non une valeur codée en dur."""
        service = AddressService()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        # Simulation d'un résultat norvégien pour vérifier qu'on ne force plus "Canada"
        mock_resp.json.return_value = {
            "features": [{
                "properties": {
                    "city": "Oslo",
                    "country": "Norway"
                },
                "geometry": {"coordinates": [10.75, 59.91]}
            }]
        }
        
        with patch('requests.get', return_value=mock_resp):
            results = service.search(q="Oslo")
            label = results[0]['label']
            
            assert "Norway" in label
            assert "Canada" not in label
