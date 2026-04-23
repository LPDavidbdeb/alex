import pytest
import json
from django.contrib.auth import get_user_model
from django.test import Client

User = get_user_model()

@pytest.fixture
def create_test_user(db):
    return User.objects.create_user(email="test_api@example.com", password="password123")

@pytest.mark.django_db
def test_get_token_with_valid_credentials(create_test_user):
    """Vérifie qu'un token JWT est retourné avec des identifiants valides."""
    client = Client()
    payload = {"email": "test_api@example.com", "password": "password123"}
    response = client.post(
        "/api/auth/token",
        data=json.dumps(payload),
        content_type="application/json"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access" in data
    assert "refresh" in data
    assert "email" in data
    assert data["email"] == "test_api@example.com"

@pytest.mark.django_db
def test_get_token_with_invalid_credentials():
    """Vérifie qu'une erreur 401 est retournée avec des identifiants invalides."""
    client = Client()
    response = client.post(
        "/api/auth/token",
        data={"email": "nonexistent@example.com", "password": "wrongpassword"},
        content_type="application/json"
    )
    
    # django-ninja-jwt retourne 401 pour des identifiants invalides
    assert response.status_code == 401

@pytest.mark.django_db
def test_cors_headers_allowed_origin(create_test_user):
    """Vérifie que les headers CORS sont présents pour l'origine autorisée."""
    client = Client()
    # On simule une requête OPTIONS (preflight)
    response = client.options(
        "/api/auth/token",
        HTTP_ORIGIN="http://localhost:5173",
        HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST"
    )
    
    assert response.status_code == 200
    assert response.headers.get("Access-Control-Allow-Origin") == "http://localhost:5173"

@pytest.mark.django_db
def test_get_me_with_valid_token(create_test_user):
    """Vérifie que /api/auth/me retourne les infos de l'utilisateur avec un token valide."""
    client = Client()
    # On obtient d'abord un token
    login_response = client.post(
        "/api/auth/token",
        data={"email": "test_api@example.com", "password": "password123"},
        content_type="application/json"
    )
    token = login_response.json()["access"]
    
    # On appelle /me avec le token
    response = client.get(
        "/api/auth/me",
        HTTP_AUTHORIZATION=f"Bearer {token}"
    )
    
    assert response.status_code == 200
    assert response.json()["email"] == "test_api@example.com"

@pytest.mark.django_db
def test_signup_with_valid_data():
    """Teste la création d'un utilisateur avec des données valides."""
    client = Client()
    payload = {
        "email": "newuser@example.com",
        "password": "strongpassword123"
    }
    response = client.post(
        "/api/auth/signup",
        data=json.dumps(payload),
        content_type="application/json"
    )
    assert response.status_code == 200
    data = response.json()
    assert "access" in data
    assert "refresh" in data
    assert data["email"] == "newuser@example.com"
    assert User.objects.filter(email="newuser@example.com").exists()

@pytest.mark.django_db
def test_signup_with_existing_email(create_test_user):
    """Teste qu'on ne peut pas s'inscrire avec un email déjà utilisé."""
    client = Client()
    payload = {
        "email": "test_api@example.com",
        "password": "somepassword"
    }
    response = client.post(
        "/api/auth/signup",
        data=json.dumps(payload),
        content_type="application/json"
    )
    assert response.status_code == 400
    assert "Un utilisateur avec cet email existe déjà" in response.json()["detail"]

@pytest.mark.django_db
def test_user_schema_resolvers():
    """Vérifie que le schéma résout bien les noms d'unité et de bannière."""
    from apps.companies.models import Company
    from apps.addresses.models import Address
    from apps.users.schemas.auth import UserSchema
    
    banner = Company.objects.create(name="Banner")
    addr = Address.objects.create(label="Unit Addr", latitude=0, longitude=0, source="X", raw_json={})
    unit = Company.objects.create(name="Unit", parent=banner, default_address=addr)
    user = User.objects.create(email="res@test.com", company=unit)
    
    schema_data = UserSchema.from_orm(user)
    assert schema_data.unit_name == "Unit"
    assert schema_data.banner_name == "Banner"
    assert schema_data.unit_address.label == "Unit Addr"

