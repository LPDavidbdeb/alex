import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import FieldError

User = get_user_model()

@pytest.mark.django_db
def test_create_user_with_email_successful():
    """Vérifie qu'un utilisateur peut être créé avec un email et un password."""
    email = "test@example.com"
    password = "password123"
    user = User.objects.create_user(email=email, password=password)
    
    assert user.email == email
    assert user.check_password(password)
    assert user.is_active is True
    assert user.is_staff is False
    assert user.is_superuser is False

@pytest.mark.django_db
def test_create_user_missing_email_fails():
    """Vérifie que la création échoue si l'email est manquant."""
    with pytest.raises(ValueError, match="L'adresse email est obligatoire"):
        User.objects.create_user(email="", password="password123")

@pytest.mark.django_db
def test_username_field_does_not_exist():
    """Vérifie que le champ username n'existe pas sur le modèle."""
    user = User(email="test@example.com")
    with pytest.raises(AttributeError):
        _ = user.username
    
    # Vérifie également au niveau des champs du modèle
    field_names = [f.name for f in User._meta.get_fields()]
    assert "username" not in field_names

@pytest.mark.django_db
def test_create_superuser_successful():
    """Vérifie que le UserManager personnalisé gère correctement la création d'un superuser."""
    email = "admin@example.com"
    password = "adminpassword"
    admin_user = User.objects.create_superuser(email=email, password=password)
    
    assert admin_user.email == email
    assert admin_user.is_active is True
    assert admin_user.is_staff is True
    assert admin_user.is_superuser is True
