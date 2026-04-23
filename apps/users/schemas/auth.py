from ninja import Schema
from pydantic import EmailStr
from typing import Optional
from apps.addresses.schemas import AddressSchema

class LoginSchema(Schema):
    email: EmailStr
    password: str

class SignUpSchema(Schema):
    email: EmailStr
    password: str

class UserSchema(Schema):
    id: int
    email: EmailStr
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    unit_name: Optional[str] = None
    banner_name: Optional[str] = None
    unit_address: Optional[AddressSchema] = None

    @staticmethod
    def resolve_unit_name(obj):
        # 1. Priorité au membership primaire
        primary = obj.memberships.filter(is_primary=True, is_active=True).first()
        if primary:
            return primary.company.name
        # 2. Fallback legacy
        return obj.company.name if obj.company else None

    @staticmethod
    def resolve_banner_name(obj):
        primary = obj.memberships.filter(is_primary=True, is_active=True).first()
        if primary and primary.company.parent:
            return primary.company.parent.name
        return obj.company.parent.name if obj.company and obj.company.parent else None

    @staticmethod
    def resolve_unit_address(obj):
        primary = obj.memberships.filter(is_primary=True, is_active=True).first()
        if primary:
            return primary.company.default_address
        return obj.company.default_address if obj.company else None

class TokenSchema(Schema):
    access: str
    refresh: str
    email: str
