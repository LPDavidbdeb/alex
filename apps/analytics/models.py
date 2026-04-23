from django.db import models
from apps.quotes.models import QuoteRequest

class QuoteAnalysis(models.Model):
    """Stockage des analyses stratégiques générées par l'IA Gemini."""
    quote = models.OneToOneField(
        QuoteRequest, 
        on_delete=models.CASCADE, 
        related_name="analysis",
        verbose_name="Soumission associée"
    )
    full_response = models.JSONField(
        verbose_name="Réponse brute de l'IA (JSON)"
    )
    model_version = models.CharField(
        max_length=50, 
        default="gemini-1.5-flash",
        verbose_name="Version du modèle IA"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Date de génération"
    )

    class Meta:
        verbose_name = "Analyse de Soumission"
        verbose_name_plural = "Analyses de Soumissions"

    def __str__(self):
        return f"Analyse pour {self.quote.uuid} ({self.created_at})"
