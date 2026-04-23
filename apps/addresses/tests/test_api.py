import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import Client

@pytest.mark.django_db
class TestAddressesAPI:
    def test_search_address_endpoint_success(self):
        """Vérifie que l'endpoint de recherche d'adresse répond correctement."""
        client = Client()
        mock_results = [{
            "label": "709 Rue Beaudoin, Montréal, QC, Canada",
            "latitude": 45.685,
            "longitude": -73.491,
            "source": "OSM",
            "raw_json": {}
        }]
        
        with patch('apps.addresses.services.AddressService.search', return_value=mock_results):
            response = client.get("/api/addresses/search?q=709rue")
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["label"] == "709 Rue Beaudoin, Montréal, QC, Canada"

    def test_search_address_short_query(self):
        """Vérifie qu'une requête trop courte renvoie une liste vide."""
        client = Client()
        response = client.get("/api/addresses/search?q=12")
        assert response.status_code == 200
        assert response.json() == []

    def test_search_address_with_country_param(self):
        """Vérifie que le paramètre country est bien reçu par l'API."""
        client = Client()
        with patch('apps.addresses.services.AddressService.search') as mock_search:
            mock_search.return_value = []
            client.get("/api/addresses/search?q=709rue&country=NO")
            mock_search.assert_called_once_with("709rue", country_code="NO")

    def test_list_countries_endpoint(self):
        """Vérifie que l'on ne liste que les pays actifs."""
        from apps.addresses.models import Country
        Country.objects.all().delete()
        Country.objects.create(name="Active", iso2="AA", iso3="AAA", is_active=True)
        Country.objects.create(name="Inactive", iso2="II", iso3="III", is_active=False)
        
        client = Client()
        response = client.get("/api/addresses/countries")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Active"
