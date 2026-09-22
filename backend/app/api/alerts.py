from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.event import AlertRecord
from app.models.schemas import AlertOut

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

@router.get("", response_model=list[AlertOut])
def list_alerts(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(AlertRecord).order_by(AlertRecord.id.desc()).limit(min(max(limit,1),500)).all()

@router.patch("/{alert_id}/status")
def update_status(alert_id: int, status: str, db: Session = Depends(get_db)):
    status = status.upper()
    if status not in {"OPEN","ACKNOWLEDGED","RESOLVED"}:
        raise HTTPException(400, "Status must be OPEN, ACKNOWLEDGED, or RESOLVED")
    alert = db.get(AlertRecord, alert_id)
    if not alert: raise HTTPException(404, "Alert not found")
    alert.status = status
    db.commit()
    return {"id":alert.id,"status":alert.status}
