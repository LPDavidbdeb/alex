import pytest
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
    response = client.post(
        "/api/auth/token",
        data={"email": "test_api@example.com", "password": "password123"},
        content_type="application/json"
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access" in data
    assert "refresh" in data

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

