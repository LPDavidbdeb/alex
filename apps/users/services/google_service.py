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
        if not self.api_key or not self.client:
            return {"status": "error", "message": "Clé API Gemini manquante."}
        try:
            models = []
            for m in self.client.models.list():
                actions = m.supported_actions or []
                if 'generateContent' in actions:
                    models.append({
                        "id": m.name.replace('models/', '') if m.name else "unknown",
                        "display_name": m.display_name or "Modèle sans nom",
                        "description": m.description or "Aucune description disponible",
                        "input_token_limit": m.input_token_limit or 0,
                        "output_token_limit": m.output_token_limit or 0
                    })
            return {"status": "success", "models": models, "message": f"Clé API valide. {len(models)} modèles."}
        except Exception as e:
            return {"status": "error", "message": f"Erreur validation: {str(e)}"}

    def get_usage_metrics(self):
        if not self.project_number:
            return {"status": "info", "message": "Project Number manquant.", "tracked_locally": False}
        try:
            client = monitoring_v3.MetricServiceClient()
            project_name = f"projects/{self.project_number}"
            now = time.time()
            seconds = int(now)
            nanos = int((now - seconds) * 10**9)
            interval = monitoring_v3.TimeInterval({
                "end_time": {"seconds": seconds, "nanos": nanos},
                "start_time": {"seconds": seconds - 86400, "nanos": nanos},
            })
            filter_str = 'resource.type="api" AND resource.labels.service="generativelanguage.googleapis.com" AND metric.type="serviceruntime.googleapis.com/api/request_count"'
            results = client.list_time_series(request={"name": project_name, "filter": filter_str, "interval": interval, "view": monitoring_v3.ListTimeSeriesRequest.TimeSeriesView.FULL})
            total_requests = sum(point.value.int64_value for result in results for point in result.points)
            return {"status": "success", "request_count": total_requests, "message": f"{total_requests} requêtes/24h.", "tracked_locally": False}
        except Exception as e:
            error_msg = str(e)
            if "billing to be enabled" in error_msg:
                return {"status": "warning", "message": "Activation du Billing requise.", "request_count": 0, "tracked_locally": False}
            return {"status": "error", "message": f"Erreur métriques: {error_msg}", "tracked_locally": False}
