import numpy as np
from sklearn.ensemble import IsolationForest

class AnomalyEngine:
    def __init__(self):
        self.model = IsolationForest(n_estimators=150, contamination=0.08, random_state=42)
        self._fit_baseline()

    def _fit_baseline(self):
        rng = np.random.default_rng(42)
        packet_count = rng.normal(40, 10, 600).clip(1)
        byte_count = (packet_count * rng.normal(650, 120, 600)).clip(100)
        unique_ports = rng.poisson(2, 600).clip(1, 8)
        failed_logins = rng.poisson(0.4, 600).clip(0, 4)
        request_rate = rng.normal(8, 2, 600).clip(0.1)
        avg_packet_size = (byte_count / packet_count).clip(50, 2000)
        X = np.column_stack([packet_count, byte_count, unique_ports, failed_logins, request_rate, avg_packet_size])
        self.model.fit(X)

    def analyze(self, event):
        packet_count = max(event.packet_count, 1)
        avg_packet_size = event.byte_count / packet_count if event.byte_count else 0
        X = np.array([[
            packet_count, event.byte_count,
            event.metadata.get("unique_ports", 1),
            event.failed_logins,
            event.metadata.get("request_rate", packet_count / 60),
            avg_packet_size
        ]])
        prediction = int(self.model.predict(X)[0])
        decision = float(self.model.decision_function(X)[0])
        anomaly = prediction == -1
        score = float(np.clip((0.15 - decision) * 50, 0, 30))
        return {"is_anomaly": anomaly, "decision_score": decision, "anomaly_score": round(score, 2)}

_engine = AnomalyEngine()

def analyze_anomaly(event):
    return _engine.analyze(event)
