from datetime import datetime, date
from uuid import UUID
from pydantic import EmailStr
from ninja import Schema
from typing import Optional, List
from apps.addresses.schemas import AddressSchema
from apps.products.schemas import ProductIn, ProductOut
from apps.users.schemas.auth import UserSchema

class EquipmentTypeOut(Schema):
    id: int
    name: str
    label_fr: str

class QuoteRequestIn(Schema):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    company_name: Optional[str] = None
    equipment_type_ids: List[int] = []
    pick_up_address: AddressSchema
    final_drop_address: AddressSchema
    is_multi_drop: bool
    pickup_date: Optional[date] = None
    delivery_date: Optional[date] = None
    product: Optional[ProductIn] = None
    incoterm: Optional[str] = None
    special_instructions: Optional[str] = None
    agreed_to_terms: bool

class QuoteMetricsIn(Schema):
    estimated_distance_km: Optional[float] = None
    estimated_duration_min: Optional[int] = None

class QuoteRequestOut(Schema):
    id: int
    uuid: UUID
    client: Optional[UserSchema] = None
    first_name: str
    last_name: str
    email: str
    phone: str
    equipment_types: List[EquipmentTypeOut]
    pick_up_address: AddressSchema
    final_drop_address: AddressSchema
    is_multi_drop: bool
    pickup_date: Optional[date] = None
    delivery_date: Optional[date] = None
    estimated_distance_km: Optional[float] = None
    estimated_duration_min: Optional[int] = None
    product: Optional[ProductOut] = None
    incoterm: Optional[str] = None
    special_instructions: Optional[str]
    created_at: datetime

class QuoteDetailContextOut(Schema):
    quote: QuoteRequestOut
    client_history: List[QuoteRequestOut]
