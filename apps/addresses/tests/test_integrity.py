import pytest
from apps.addresses.models import Address
from decimal import Decimal

@pytest.mark.django_db
class TestAddressIntegrity:
    def test_address_label_formatting_with_house_number(self):
        """Vérifie que le label de l'adresse inclut bien le numéro s'il est présent dans le JSON brut."""
        # Simulation d'une réponse OSM réelle avec numéro
        raw_data = {
            "properties": {
                "house_number": "709",
                "street": "Rue Beaudoin",
                "city": "Montréal",
                "postcode": "H1A 3P9",
                "state": "Québec"
            },
            "geometry": {
                "coordinates": [-73.491716, 45.685908]
            }
        }
        
        # On crée l'objet comme le ferait le router
        # Note: on vérifie aussi la conversion string -> decimal qui semble poser problème
        addr = Address.objects.create(
            label="709 Rue Beaudoin, Montréal, QC",
            latitude=Decimal("45.685908"),
            longitude=Decimal("-73.491716"),
            source="OSM",
            raw_json=raw_data
        )
        
        assert "709" in addr.label
        assert addr.city == "Montréal"
        assert addr.province == "Québec"
        
    def test_decimal_precision_integrity(self):
        """Vérifie que les coordonnées ne sont pas altérées par le stockage Decimal."""
        lat_str = "45.685908"
        addr = Address.objects.create(
            label="Test Precision",
            latitude=Decimal(lat_str),
            longitude=Decimal("-73.491716"),
            source="Test",
            raw_json={}
        )
        
        # Vérification de la valeur stockée (doit être identique à la string originale)
        assert str(addr.latitude) == lat_str

    def test_house_number_detection_from_query(self, db):
        """Vérifie que le service récupère le numéro de rue depuis la requête si Photon l'omet."""
        from apps.addresses.services import AddressService
        from unittest.mock import patch, MagicMock
        
        service = AddressService()
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        # Réponse sans house_number
        mock_resp.json.return_value = {
            "features": [{
                "properties": {"street": "Rue Beaudoin", "city": "Montréal"},
                "geometry": {"coordinates": [0, 0]}
            }]
        }
        
        with patch('requests.get', return_value=mock_resp):
            results = service.search(q="709 rue beaudoin")
            assert "709" in results[0]['label']
            assert results[0]['label'].startswith("709")

    def test_city_fallback_logic(self):
        """Vérifie l'ordre de fallback : city -> town -> village."""
        # 1. Town fallback
        addr_town = Address(source="OSM", raw_json={"properties": {"town": "MyTown"}})
        assert addr_town.city == "MyTown"
        
        # 2. Village fallback
        addr_village = Address(source="OSM", raw_json={"properties": {"village": "MyVillage"}})
        assert addr_village.city == "MyVillage"
        
        # 3. Non-OSM empty
        addr_other = Address(source="Other", raw_json={"properties": {"city": "X"}})
        assert addr_other.city == ""

    def test_country_str(self, db):
        from apps.addresses.models import Country
        c = Country.objects.create(name="Canada", iso2="CA", iso3="CAN")
        assert str(c) == "Canada"
