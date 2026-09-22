SEVERITY_SCORE = {"LOW": 20, "MEDIUM": 40, "HIGH": 65, "CRITICAL": 85}

def calculate_risk(signature_detected, signature_severity, anomaly_score=0.0, threat_indicator=False):
    score = 0
    if signature_detected:
        score += SEVERITY_SCORE.get(signature_severity, 0)
    score += int(min(max(anomaly_score, 0), 30))
    if threat_indicator:
        score += 15
    return min(score, 100)

def risk_level(score):
    if score >= 81: return "CRITICAL"
    if score >= 61: return "HIGH"
    if score >= 31: return "MEDIUM"
    return "LOW"
