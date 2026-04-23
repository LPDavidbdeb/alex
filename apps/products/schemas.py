from ninja import Schema
from typing import Optional
from decimal import Decimal

class ProductIn(Schema):
    product_type: str
    value: Optional[Decimal] = None
    is_perishable: bool = False
    is_dangerous: bool = False
    hs_code: Optional[str] = None
    weight_kg: Optional[float] = None
    volume_m3: Optional[float] = None

class ProductOut(Schema):
    id: int
    product_type: str
    value: Optional[Decimal] = None
    is_perishable: bool
    is_dangerous: bool
    hs_code: Optional[str]
    weight_kg: Optional[float]
    volume_m3: Optional[float]
