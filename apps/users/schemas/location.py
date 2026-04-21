from ninja import Schema
from typing import Any, Dict

class AddressSaveSchema(Schema):
    """Schéma pour la sauvegarde d'une adresse avec sa source (provider)."""
    provider: str  # 'google' ou 'opensource'
    formatted_address: str
    latitude: float
    longitude: float
    data: Dict[str, Any]  # L'objet JSON brut provenant du provider
