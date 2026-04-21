from google import genai
from google.cloud import monitoring_v3
from django.conf import settings
import logging
import time

logger = logging.getLogger(__name__)

class GoogleService:
    def __init__(self, api_key: str = None, project_number: str = None):
        self.api_key = api_key or getattr(settings, 'GEMINI_API_KEY', None)
        self.project_number = project_number or getattr(settings, 'GOOGLE_PROJECT_NUMBER', None)
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def verify_key(self):
        """
        Tests the API key by listing available models.
        """
        if not self.api_key or not self.client:
            return {
                "status": "error",
                "message": "Clé API Gemini manquante dans la configuration."
            }
        
        try:
            models = []
            for m in self.client.models.list():
                # In google-genai, the actions are returned as strings in PascalCase
                actions = m.supported_actions or []
                if 'generateContent' in actions:
                    models.append({
                        "id": m.name.replace('models/', '') if m.name else "unknown",
                        "display_name": m.display_name or "Modèle sans nom",
                        "description": m.description or "Aucune description disponible",
                        "input_token_limit": m.input_token_limit or 0,
                        "output_token_limit": m.output_token_limit or 0
                    })
            
            return {
                "status": "success",
                "models": models,
                "message": f"Clé API valide. {len(models)} modèles détectés."
            }
        except Exception as e:
            logger.error(f"Erreur lors de la vérification de la clé Gemini: {str(e)}")
            return {
                "status": "error",
                "message": f"Erreur de validation: {str(e)}"
            }

    def get_usage_metrics(self):
        """
        Retrieves usage metrics using Google Cloud Monitoring.
        Fetches request count for the last 24 hours.
        """
        if not self.project_number:
            return {
                "status": "info",
                "message": "Project Number manquant. Impossible de récupérer les métriques.",
                "tracked_locally": False
            }

        try:
            client = monitoring_v3.MetricServiceClient()
            project_name = f"projects/{self.project_number}"
            
            # 24h interval
            now = time.time()
            seconds = int(now)
            nanos = int((now - seconds) * 10**9)
            interval = monitoring_v3.TimeInterval({
                "end_time": {"seconds": seconds, "nanos": nanos},
                "start_time": {"seconds": seconds - 86400, "nanos": nanos},
            })

            # Filter for Gemini API (Generative Language API) request count
            # Note: serviceruntime request_count is a standard metric for Google APIs
            filter_str = (
                'resource.type="api" AND '
                'resource.labels.service="generativelanguage.googleapis.com" AND '
                'metric.type="serviceruntime.googleapis.com/api/request_count"'
            )

            results = client.list_time_series(
                request={
                    "name": project_name,
                    "filter": filter_str,
                    "interval": interval,
                    "view": monitoring_v3.ListTimeSeriesRequest.TimeSeriesView.FULL,
                }
            )

            total_requests = 0
            for result in results:
                for point in result.points:
                    total_requests += point.value.int64_value

            return {
                "status": "success",
                "request_count": total_requests,
                "message": f"{total_requests} requêtes dans les dernières 24h.",
                "tracked_locally": False
            }
        except Exception as e:
            error_msg = str(e)
            if "billing to be enabled" in error_msg:
                return {
                    "status": "warning",
                    "message": "L'affichage des métriques nécessite l'activation de la facturation sur votre console Google Cloud (Billing).",
                    "request_count": 0,
                    "tracked_locally": False
                }
            
            logger.error(f"Erreur Cloud Monitoring: {error_msg}")
            return {
                "status": "error",
                "message": f"Erreur métriques: {error_msg}",
                "tracked_locally": False
            }
