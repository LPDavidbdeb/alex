import uuid
from django.db import models
from django.conf import settings
from apps.addresses.models import Address
from apps.products.models import Product
from apps.companies.models import Company

class EquipmentType(models.Model):
    name = models.CharField(max_length=100)
    label_fr = models.CharField(max_length=100)

    def __str__(self):
        return self.label_fr

class QuoteRequest(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    # Relations
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quote_requests", null=True, blank=True)
    client_company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name="quotes")
    product = models.OneToOneField(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="quote")
    
    # Contact (Snapshot lors de la demande)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    
    # Logistique
    pick_up_address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name="quotes_pickup", null=True, blank=True)
    final_drop_address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name="quotes_drop", null=True, blank=True)
    is_multi_drop = models.BooleanField(default=False)
    
    equipment_types = models.ManyToManyField(EquipmentType, blank=True)
    incoterm = models.CharField(max_length=20, blank=True, null=True)
    
    # Planification
    pickup_date = models.DateField(null=True, blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    
    # Métriques persistantes
    estimated_distance_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_duration_min = models.IntegerField(null=True, blank=True)
    
    special_instructions = models.TextField(blank=True, null=True)
    agreed_to_terms = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Quote {self.uuid}"
