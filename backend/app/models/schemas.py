from datetime import datetime
from pydantic import BaseModel

class AlertOut(BaseModel):
    id: int
    created_at: datetime
    event_id: int | None
    source_ip: str
    threat_type: str
    severity: str
    risk_score: int
    status: str
    rule_id: str | None
    description: str | None
    anomaly_score: float
    class Config:
        from_attributes = True
