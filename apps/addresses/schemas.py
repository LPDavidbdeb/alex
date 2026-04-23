from ninja import Schema
from typing import Optional

class CountryOut(Schema):
    id: int
    name: str
    iso2: str

class AddressSchema(Schema):
    label: str
    latitude: float
    longitude: float
    source: str
    raw_json: dict
    # Utilisation du nom exact du champ database pour éviter les erreurs de création
    country_ref_id: Optional[int] = None
