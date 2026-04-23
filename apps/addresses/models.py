from django.db import models

class Country(models.Model):
    """Référentiel international complet des pays."""
    name = models.CharField(max_length=200, default="Unknown", verbose_name="Nom")
    sovereignty = models.CharField(max_length=200, blank=True, null=True, verbose_name="Souveraineté")
    iso2 = models.CharField(max_length=2, unique=True, verbose_name="ISO 3166-1 (A-2)")
    iso3 = models.CharField(max_length=3, unique=True, verbose_name="ISO 3166-1 (A-3)")
    iso_num = models.IntegerField(null=True, blank=True, verbose_name="ISO 3166-1 (NUM)")
    subdivision_code = models.CharField(max_length=50, blank=True, null=True, verbose_name="Subdivision Code")
    tld = models.CharField(max_length=10, blank=True, null=True, verbose_name="TLD")
    
    is_active = models.BooleanField(default=True, verbose_name="Zone desservie")

    class Meta:
        verbose_name = "Pays"
        verbose_name_plural = "Pays"
        ordering = ['name']

    def __str__(self):
        return self.name

class Address(models.Model):
    label = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    country_ref = models.ForeignKey(Country, on_delete=models.PROTECT, null=True, related_name="addresses")
    source = models.CharField(max_length=50)
    raw_json = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Adresse"
        verbose_name_plural = "Adresses"

    def __str__(self):
        return self.label

    @property
    def city(self):
        if self.source == "OSM":
            props = self.raw_json.get('properties', {})
            return props.get('city') or props.get('town') or props.get('village') or ""
        return ""

    @property
    def province(self):
        if self.source == "OSM":
            return self.raw_json.get('properties', {}).get('state', '')
        return ""
