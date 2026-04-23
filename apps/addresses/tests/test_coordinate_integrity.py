import pytest
from apps.addresses.models import Address
from apps.addresses.schemas import AddressSchema
from decimal import Decimal

@pytest.mark.django_db
class TestCoordinateIntegrity:
    def test_decimal_storage_precision(self):
        """Vérifie que Postgres stocke exactement la coordonnée fournie."""
        # Coordonnées de votre Quote #4
        lat_val = "45.685908"
        lng_val = "-73.491716"
        
        addr = Address.objects.create(
            label="Test Precision",
            latitude=Decimal(lat_val),
            longitude=Decimal(lng_val),
            source="OSM",
            raw_json={}
        )
        
        # Relecture depuis la DB
        addr.refresh_from_db()
        assert str(addr.latitude) == lat_val
        assert str(addr.longitude) == lng_val

    def test_pydantic_serialization_type(self):
        """Vérifie que le schéma Ninja convertit bien le Decimal en Float pour le JSON."""
        addr = Address(
            label="Test Schema",
            latitude=Decimal("45.685908"),
            longitude=Decimal("-73.491716"),
            source="OSM",
            raw_json={}
        )
        
        # Simulation de la sérialisation Ninja
        schema_data = AddressSchema.from_orm(addr)
        
        # Le frontend DOIT recevoir des numbers, pas des strings
        assert isinstance(schema_data.latitude, float)
        assert schema_data.latitude == 45.685908
        assert isinstance(schema_data.longitude, float)

    def test_house_number_preservation(self):
        """Vérifie que la logique de 'Label Intelligent' ne perd pas le numéro."""
        from apps.addresses.services import AddressService
        from unittest.mock import patch, MagicMock
        
        service = AddressService()
        # On simule une réponse OSM qui a le numéro dans properties
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "features": [{
                "properties": {
                    "house_number": "709",
                    "street": "Rue Beaudoin",
                    "city": "Montréal"
                },
                "geometry": {"coordinates": [-73.4, 45.4]}
            }]
        }
        
        with patch('requests.get', return_value=mock_resp):
            results = service.search(q="709 rue beaudoin")
            # Le label DOIT commencer par le numéro
            assert results[0]['label'].startswith("709")
            assert "Rue Beaudoin" in results[0]['label']
