from django.db import models
from django.db.models import Q, CheckConstraint
from django.core.exceptions import ValidationError
from apps.addresses.models import Address

class Company(models.Model):
    """
    Modèle d'entreprise gérant la hiérarchie Bannière / Succursale.
    Utilise une Adjacency List (parent_id) pour la flexibilité.
    """
    TYPE_CHOICES = [
        ('BANNER', 'Bannière / Siège Social'),
        ('BRANCH', 'Succursale / Magasin'),
        ('INDEPENDENT', 'Indépendante / Compagnie à numéro'),
    ]

    name = models.CharField(max_length=255, verbose_name="Nom de l'entreprise")
    company_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='INDEPENDENT')
    
    # Relation Réflexive (Adjacency List)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='branches',
        verbose_name="Entreprise parente (Bannière)"
    )
    
    registration_number = models.CharField(max_length=100, blank=True, null=True, verbose_name="NEQ / No. Entreprise")
    default_address = models.ForeignKey(
        Address, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="companies",
        verbose_name="Adresse principale"
    )
    
    is_billing_center = models.BooleanField(default=True, verbose_name="Centre de facturation")
    is_synthetic = models.BooleanField(default=False, verbose_name="Créé automatiquement")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Entreprise"
        verbose_name_plural = "Entreprises"
        ordering = ['name']
        constraints = [
            # BRANCH doit avoir un parent
            CheckConstraint(
                condition=~Q(company_type='BRANCH') | Q(parent__isnull=False),
                name='branch_must_have_parent'
            ),
            # BANNER et INDEPENDENT ne doivent pas avoir de parent
            CheckConstraint(
                condition=~Q(company_type__in=['BANNER', 'INDEPENDENT']) | Q(parent__isnull=True),
                name='banner_and_independent_must_not_have_parent'
            ),
        ]

    def clean(self):
        super().clean()
        if self.company_type == 'BRANCH' and not self.parent:
            raise ValidationError("Une succursale doit obligatoirement être rattachée à une bannière.")
        if self.company_type in ['BANNER', 'INDEPENDENT'] and self.parent:
            raise ValidationError(f"Une entité de type {self.get_company_type_display()} ne peut pas avoir d'entité parente.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.get_company_type_display()})"

class UserCompanyMembership(models.Model):
    """
    Table de liaison entre Utilisateurs et Entreprises.
    Permet à un utilisateur d'appartenir à plusieurs unités.
    """
    ROLE_CHOICES = [
        ('OWNER', 'Propriétaire'),
        ('BUYER', 'Acheteur / Donneur d\'ordre'),
        ('EMPLOYEE', 'Employé'),
        ('ACCOUNTING', 'Comptabilité'),
    ]

    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='memberships')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='members')
    
    role_in_company = models.CharField(max_length=20, choices=ROLE_CHOICES, default='EMPLOYEE')
    is_primary = models.BooleanField(default=False, verbose_name="Unité principale")
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Affiliation Entreprise"
        verbose_name_plural = "Affiliations Entreprises"
        unique_together = ('user', 'company')
        
    def __str__(self):
        return f"{self.user.email} @ {self.company.name} ({self.role_in_company})"
