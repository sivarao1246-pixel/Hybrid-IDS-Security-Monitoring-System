from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.event import EventRecord, AlertRecord

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    total_events = db.query(func.count(EventRecord.id)).scalar() or 0
    total_alerts = db.query(func.count(AlertRecord.id)).scalar() or 0
    critical = db.query(func.count(AlertRecord.id)).filter(AlertRecord.severity=="CRITICAL").scalar() or 0
    high = db.query(func.count(AlertRecord.id)).filter(AlertRecord.severity=="HIGH").scalar() or 0
    open_alerts = db.query(func.count(AlertRecord.id)).filter(AlertRecord.status!="RESOLVED").scalar() or 0
    top = db.query(AlertRecord.source_ip, func.count(AlertRecord.id).label("count")).group_by(AlertRecord.source_ip).order_by(func.count(AlertRecord.id).desc()).limit(5).all()
    return {"total_events":total_events,"total_alerts":total_alerts,"critical_alerts":critical,"high_alerts":high,
            "open_alerts":open_alerts,"top_sources":[{"source_ip":ip,"count":count} for ip,count in top]}

@router.get("/events")
def recent_events(limit:int=30, db:Session=Depends(get_db)):
    rows=db.query(EventRecord).order_by(EventRecord.id.desc()).limit(min(max(limit,1),100)).all()
    return [{"id":r.id,"timestamp":r.timestamp.isoformat(),"source_ip":r.source_ip,"destination_ip":r.destination_ip,
             "event_type":r.event_type,"protocol":r.protocol,"packet_count":r.packet_count,"byte_count":r.byte_count} for r in rows]
