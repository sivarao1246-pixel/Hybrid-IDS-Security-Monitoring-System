import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.event import SecurityEvent, EventRecord, AlertRecord
from app.detection.signature_engine import detect_signature
from app.detection.anomaly_engine import analyze_anomaly
from app.detection.correlation import calculate_risk, risk_level
from app.websocket.manager import manager

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.post("")
async def process_event(event: SecurityEvent, db: Session = Depends(get_db)):
    signature = detect_signature(event)
    anomaly = analyze_anomaly(event)
    indicator = bool(event.metadata.get("known_bad_ip", False))
    risk = calculate_risk(signature.detected, signature.severity, anomaly["anomaly_score"], indicator)
    level = risk_level(risk)

    record = EventRecord(
        timestamp=event.timestamp, source_ip=event.source_ip, destination_ip=event.destination_ip,
        source_port=event.source_port, destination_port=event.destination_port, protocol=event.protocol,
        packet_count=event.packet_count, byte_count=event.byte_count, event_type=event.event_type,
        failed_logins=event.failed_logins, metadata_json=json.dumps(event.metadata))
    db.add(record)
    db.flush()

    is_threat = signature.detected or anomaly["is_anomaly"] or indicator
    alert = None
    if is_threat:
        threat = signature.threat_type or ("ANOMALY" if anomaly["is_anomaly"] else "THREAT_INDICATOR")
        severity = "CRITICAL" if level == "CRITICAL" else ("HIGH" if level == "HIGH" else "MEDIUM")
        alert = AlertRecord(
            created_at=event.timestamp, event_id=record.id, source_ip=event.source_ip,
            threat_type=threat, severity=severity, risk_score=risk, status="OPEN",
            rule_id=signature.rule_id, description=signature.description or "Unusual network behaviour detected.",
            anomaly_score=anomaly["anomaly_score"])
        db.add(alert)
        db.commit()
        db.refresh(alert)
        await manager.broadcast({"type":"alert","alert":{
            "id":alert.id,"source_ip":alert.source_ip,"threat_type":alert.threat_type,
            "severity":alert.severity,"risk_score":alert.risk_score,"status":alert.status,
            "created_at":alert.created_at.isoformat()}})
    else:
        db.commit()

    return {
        "event_id": record.id,
        "signature_detection": {"detected":signature.detected,"threat_type":signature.threat_type,
            "severity":signature.severity,"rule_id":signature.rule_id,"description":signature.description},
        "anomaly_detection": anomaly,
        "risk_score": risk,
        "risk_level": level,
        "alert_id": alert.id if alert else None
    }
