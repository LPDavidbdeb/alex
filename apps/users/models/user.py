from typing import Any, Optional
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    """Manager personnalisé pour le modèle User où l'email est l'identifiant unique."""

    def create_user(self, email: str, password: Optional[str] = None, **extra_fields: Any) -> 'User':
        """Crée et enregistre un utilisateur avec l'email et le mot de passe donnés."""
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: Optional[str] = None, **extra_fields: Any) -> 'User':
        """Crée et enregistre un superutilisateur avec l'email et le mot de passe donnés."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Modèle utilisateur personnalisé sans username, utilisant l'email comme identifiant unique."""

    email = models.EmailField(unique=True, verbose_name="Adresse email")
    is_staff = models.BooleanField(default=False, verbose_name="Statut équipe")
    is_active = models.BooleanField(default=True, verbose_name="Actif")
    date_joined = models.DateTimeField(default=timezone.now, verbose_name="Date d'inscription")

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"

    def __str__(self) -> str:
        return self.email
