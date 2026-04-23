import os
import json
from typing import Dict, Any, List, Optional
from google import genai
from django.conf import settings
from apps.quotes.models import QuoteRequest
from .models import QuoteAnalysis

class LogisticsAnalystService:
    """Service d'intelligence artificielle pour l'analyse stratégique logistique."""

    def __init__(self, api_key: str = None):
        self.api_key = api_key or getattr(settings, 'GEMINI_API_KEY', None)
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        # Mise à jour vers le modèle 2.0 beaucoup plus stable et rapide
        self.model_name = "gemini-2.0-flash"

    def analyze_quote(self, quote_id: int) -> Optional[QuoteAnalysis]:
        """Orchestre l'analyse complète d'un devis par l'IA."""
        quote = QuoteRequest.objects.get(id=quote_id)
        
        # 1. Préparer le contexte métier
        payload = self._prepare_payload(quote)
        
        # 2. Appeler Gemini avec un prompt structuré
        ai_response = self._call_gemini(payload)
        
        # 3. Sauvegarder en base de données
        analysis, _ = QuoteAnalysis.objects.update_or_create(
            quote=quote,
            defaults={
                "full_response": ai_response,
                "model_version": self.model_name
            }
        )
        return analysis

    def _prepare_payload(self, quote: QuoteRequest) -> Dict[str, Any]:
        """Compile toutes les données nécessaires pour l'IA."""
        product = quote.product
        return {
            "quote_uuid": str(quote.uuid),
            "product": {
                "type": product.product_type if product else "Inconnu",
                "weight_kg": product.weight_kg if product else 0,
                "volume_m3": product.volume_m3 if product else 0,
                "value_cad": float(product.value) if product and product.value else 0,
                "is_perishable": product.is_perishable if product else False,
                "is_dangerous": product.is_dangerous if product else False,
            },
            "logistics": {
                "origin": quote.pick_up_address.label,
                "destination": quote.final_drop_address.label,
                "distance_km": float(quote.estimated_distance_km) if quote.estimated_distance_km else 0,
                "duration_min": quote.estimated_duration_min or 0,
                "incoterm": quote.incoterm or "Non spécifié",
                "pickup_date": str(quote.pickup_date) if quote.pickup_date else "ASAP",
                "delivery_date": str(quote.delivery_date) if quote.delivery_date else "Non spécifié",
                "is_multi_drop": quote.is_multi_drop
            },
            "market_context": self._get_mock_market_rates() # Simulation de prix du marché
        }

    def _get_mock_market_rates(self) -> Dict[str, Any]:
        """Simulation de tarifs de fret pour guider le raisonnement de l'IA."""
        return {
            "road_express": {"cost_est": 2500, "tt_days": 2, "co2_kg": 450},
            "road_eco": {"cost_est": 1200, "tt_days": 5, "co2_kg": 380},
            "rail_option": {"cost_est": 800, "tt_days": 10, "co2_kg": 120}
        }

    def _call_gemini(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Envoie le contexte à Gemini et récupère l'analyse structurée."""
        if not self.client:
            return {"error": "API Key manquante"}

        system_prompt = (
            "Tu es un consultant Senior en Supply Chain et Logistique chez RM Logistique. "
            "Ton rôle est d'analyser les données de transport fournies et de proposer une analyse stratégique. "
            "Calcule le coût total de possession (Total Landed Cost) incluant le fret et le coût d'immobilisation du capital (Inventory Carrying Cost à 15% par an). "
            "Réponds exclusivement au format JSON avec la structure suivante : "
            "{ 'scenarios': [ { 'name', 'type', 'estimated_total_cost', 'transit_time', 'pros': [], 'cons': [], 'risk_score' (1-10) } ], "
            "  'global_analysis': 'Résumé stratégique', 'recommendation': 'Le meilleur choix' }"
        )

        user_content = f"Voici les données du dossier : {json.dumps(payload, indent=2)}"
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                config={
                    "response_mime_type": "application/json",
                },
                contents=[system_prompt, user_content]
            )
            return json.loads(response.text)
        except Exception as e:
            return {
                "error": f"Erreur IA: {str(e)}",
                "raw_output": response.text if 'response' in locals() else None,
                "raw_payload": payload
            }

