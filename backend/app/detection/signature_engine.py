from app.models.event import SecurityEvent

class SignatureDetectionResult:
    def __init__(self, detected=False, threat_type=None, severity="LOW", rule_id=None, description=None):
        self.detected = detected
        self.threat_type = threat_type
        self.severity = severity
        self.rule_id = rule_id
        self.description = description

def detect_signature(event: SecurityEvent) -> SignatureDetectionResult:
    if event.event_type.upper() == "PORT_SCAN" or event.metadata.get("unique_ports", 0) >= 10:
        return SignatureDetectionResult(True, "PORT_SCAN", "HIGH", "SIG-PORTSCAN-001",
            "Multiple destination ports contacted by a single source.")
    if event.failed_logins >= 10 or event.event_type.upper() == "BRUTE_FORCE":
        return SignatureDetectionResult(True, "BRUTE_FORCE", "HIGH", "SIG-BRUTEFORCE-001",
            "High number of failed authentication attempts.")
    if event.event_type.upper() == "SUSPICIOUS_HTTP":
        return SignatureDetectionResult(True, "SUSPICIOUS_HTTP", "HIGH", "SIG-HTTP-001",
            "Suspicious HTTP request pattern detected.")
    if event.metadata.get("known_bad_ip") is True:
        return SignatureDetectionResult(True, "KNOWN_BAD_IP", "CRITICAL", "SIG-IOC-001",
            "Source matched a configured demonstration threat indicator.")
    return SignatureDetectionResult()
