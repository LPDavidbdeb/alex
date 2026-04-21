from ninja import Schema
from typing import List, Optional

class GeminiModelSchema(Schema):
    id: str
    display_name: Optional[str] = ""
    description: Optional[str] = ""
    input_token_limit: Optional[int] = 0
    output_token_limit: Optional[int] = 0

class GoogleStatusSchema(Schema):
    status: str
    message: str
    models: Optional[List[GeminiModelSchema]] = None

class UsageMetricsSchema(Schema):
    status: str
    message: str
    tracked_locally: bool
    request_count: Optional[int] = None
