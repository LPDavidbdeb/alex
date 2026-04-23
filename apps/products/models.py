from django.db import models

class Product(models.Model):
    """Informations techniques sur la marchandise transportée."""
    product_type = models.CharField(max_length=200, verbose_name="Type de produit")
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Valeur (CAD)")
    is_perishable = models.BooleanField(default=False, verbose_name="Périssable")
    is_dangerous = models.BooleanField(default=False, verbose_name="Matière dangereuse")
    hs_code = models.CharField(max_length=20, blank=True, null=True, verbose_name="Code HS")
    
    # Dimensions
    weight_kg = models.FloatField(null=True, blank=True, verbose_name="Poids total (kg)")
    volume_m3 = models.FloatField(null=True, blank=True, verbose_name="Volume total (m3)")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product_type} ({self.weight_kg or 0} kg)"
