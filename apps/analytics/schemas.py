from ninja import Schema
from datetime import datetime
from typing import Any, Dict

class QuoteAnalysisOut(Schema):
    id: int
    full_response: Dict[str, Any]
    model_version: str
    created_at: datetime
