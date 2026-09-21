from app.models.event import SecurityEvent
from app.detection.signature_engine import detect_signature
from app.detection.correlation import calculate_risk, risk_level
from app.detection.anomaly_engine import analyze_anomaly

def test_port_scan_signature():
    e=SecurityEvent(source_ip="192.168.56.10",event_type="PORT_SCAN",metadata={"unique_ports":25})
    r=detect_signature(e)
    assert r.detected and r.threat_type=="PORT_SCAN"

def test_bruteforce_signature():
    e=SecurityEvent(source_ip="192.168.56.11",failed_logins=20)
    r=detect_signature(e)
    assert r.detected and r.threat_type=="BRUTE_FORCE"

def test_risk_levels():
    assert risk_level(calculate_risk(True,"HIGH",0))=="HIGH"
    assert risk_level(calculate_risk(True,"CRITICAL",10))=="CRITICAL"
    assert risk_level(10)=="LOW"

def test_anomaly_engine():
    e=SecurityEvent(source_ip="192.168.56.12",packet_count=40,byte_count=24000,metadata={"unique_ports":2})
    r=analyze_anomaly(e)
    assert "is_anomaly" in r and "anomaly_score" in r
