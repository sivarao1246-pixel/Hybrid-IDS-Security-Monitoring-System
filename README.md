# Hybrid Intrusion Detection & Security Monitoring System

An educational defensive cybersecurity prototype that combines **signature-based intrusion detection** with **machine-learning-based anomaly detection**.

## Main Features

- Signature-based threat detection
- Isolation Forest anomaly detection
- Hybrid risk correlation
- Risk scoring and severity classification
- Security alert generation
- SQLite persistence
- FastAPI REST APIs
- WebSocket-based live alert updates
- React/Vite security monitoring dashboard
- Safe local event simulator
- Docker-based deployment
- Automated backend tests

> **Purpose:** Educational and defensive cybersecurity research/prototyping only. The included simulator generates controlled JSON events locally and does not perform real attacks.

## Architecture

```text
Security Event
      |
      v
FastAPI Event API
      |
      +----------------------+
      |                      |
      v                      v
Signature Engine       ML Anomaly Engine
      |                      |
      +----------+-----------+
                 |
                 v
          Risk Correlation
                 |
                 v
            Risk Score
                 |
          +------+------+
          |             |
          v             v
        Alert        No Alert
          |
          v
       SQLite
          |
     +----+----+
     |         |
     v         v
 REST API  WebSocket
     |         |
     +----+----+
          |
          v
   React Dashboard
```

## Technology Stack

### Backend
- Python 3.10+
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- SQLite
- Scikit-learn
- Scapy

### Frontend
- React
- Vite
- Recharts
- Lucide React
- CSS

### Testing
- Pytest

### Deployment
- Docker
- Docker Compose

## Project Structure

```text
hybrid-ids/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── alerts.py
│   │   │   ├── dashboard.py
│   │   │   ├── events.py
│   │   │   └── health.py
│   │   ├── collectors/
│   │   │   └── packet_collector.py
│   │   ├── database/
│   │   │   └── database.py
│   │   ├── detection/
│   │   │   ├── anomaly_engine.py
│   │   │   ├── correlation.py
│   │   │   └── signature_engine.py
│   │   ├── models/
│   │   │   ├── event.py
│   │   │   └── schemas.py
│   │   ├── websocket/
│   │   │   └── manager.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_detection.py
│   ├── Dockerfile
│   ├── pytest.ini
│   ├── requirements.txt
│   └── ids.db
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── simulator/
│   ├── simulator.py
│   └── requirements.txt
├── docs/
│   └── API.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Detection

### Port Scan

Triggered when:

```text
unique_ports >= 10
```

Rule:

```text
SIG-PORTSCAN-001
```

Threat:

```text
PORT_SCAN
```

### Brute Force

Triggered when:

```text
failed_logins >= 10
```

Rule:

```text
SIG-BRUTEFORCE-001
```

Threat:

```text
BRUTE_FORCE
```

### Suspicious HTTP

Rule:

```text
SIG-HTTP-001
```

Threat:

```text
SUSPICIOUS_HTTP
```

### Known-Bad Indicator

The event metadata supports a demonstration `known_bad_ip` indicator:

```json
{
  "metadata": {
    "known_bad_ip": true
  }
}
```

## Machine Learning Detection

The ML component uses an **Isolation Forest** model to identify unusual network behavior.

Features include:

- Packet count
- Byte count
- Unique destination ports
- Request rate
- Failed login activity

The ML engine returns:

```text
is_anomaly
decision_score
anomaly_score
```

## ML-Only Detection

The system can detect unusual behavior even when no signature rule matches.

The simulator's anomaly scenario intentionally keeps:

```text
unique_ports < 10
```

while maintaining highly unusual traffic characteristics.

Expected result:

```text
Signature Detection: False
ML Anomaly: True
```

## Hybrid Detection

A security event can trigger both detection engines:

```text
Signature: PORT_SCAN
ML:        ANOMALY
Risk:      CRITICAL
```

The correlation layer combines these signals to produce the final risk score and severity.

## Risk Levels

```text
LOW
MEDIUM
HIGH
CRITICAL
```

## Alert Lifecycle

```text
OPEN
  |
  v
ACKNOWLEDGED
  |
  v
RESOLVED
```

Status API examples:

```http
PATCH /api/alerts/{id}/status?status=ACKNOWLEDGED
PATCH /api/alerts/{id}/status?status=RESOLVED
```

## Database

SQLite is used by default.

Local database:

```text
backend/ids.db
```

Inside Docker:

```text
/app/ids.db
```

The database stores security events, generated alerts, detection results, risk scores, statuses, and timestamps.

## REST API

### Health

```http
GET /api/health
```

### Create Event

```http
POST /api/events
```

### Get Alerts

```http
GET /api/alerts
GET /api/alerts?limit=20
```

### Update Alert Status

```http
PATCH /api/alerts/{id}/status?status=ACKNOWLEDGED
PATCH /api/alerts/{id}/status?status=RESOLVED
```

### Dashboard Summary

```http
GET /api/dashboard/summary
```

Returns:

- Total events
- Total alerts
- Critical alerts
- High alerts
- Open alerts
- Top source IPs

### Dashboard Events

```http
GET /api/dashboard/events
GET /api/dashboard/events?limit=30
```

## WebSocket

Live alert updates:

```text
/ws/alerts
```

The React dashboard connects to the WebSocket and refreshes dashboard data when new alerts are broadcast.

## Dashboard

The dashboard displays:

- System live/offline status
- Events analyzed
- Total alerts
- Critical alerts
- Open alerts
- Threat activity chart
- Top source IPs
- Recent security alerts
- Signature engine status
- ML engine status
- Database status
- WebSocket status

Backend timestamps are converted to the browser's local timezone for display.

# Docker Deployment

From the project root:

```powershell
docker compose up -d
```

Check containers:

```powershell
docker compose ps
```

Expected services:

```text
hybrid-ids-backend
hybrid-ids-frontend
```

### URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

Health:

```text
http://localhost:8000/api/health
```

## Stop Docker

```powershell
docker compose down
```

## Restart Docker

```powershell
docker compose down
docker compose up -d
```

Check:

```powershell
docker compose ps
```

Health:

```powershell
Invoke-RestMethod "http://localhost:8000/api/health"
```

Expected:

```text
status        : healthy
database      : sqlite
database_path : /app/ids.db
```

# Local Backend Setup

If Docker is not being used:

```powershell
cd backend

python -m venv .venv

.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

python -m uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

# Local Frontend Setup

Open a second terminal:

```powershell
cd frontend

npm install

npm run dev
```

Dashboard:

```text
http://localhost:5173
```

# Safe Event Simulator

The simulator sends controlled JSON events to:

```text
http://127.0.0.1:8000/api/events
```

Run:

```powershell
cd simulator

pip install -r requirements.txt

python simulator.py
```

Menu:

```text
1 Normal
2 Port Scan
3 Brute Force
4 Anomaly
5 Suspicious HTTP
6 Demo Sequence
```

The simulator does not perform real attacks.

### Option 1 — Normal

Expected:

```text
Signature Detection: False
ML Anomaly: False
Risk Score: 0
No Alert
```

### Option 2 — Port Scan

Expected:

```text
Threat: PORT_SCAN
Signature: True
```

### Option 3 — Brute Force

Expected:

```text
Threat: BRUTE_FORCE
Signature: True
```

### Option 4 — Anomaly

Expected:

```text
Signature Detection: False
ML Anomaly: True
```

### Option 5 — Suspicious HTTP

Expected:

```text
Threat: SUSPICIOUS_HTTP
Signature: True
```

### Option 6 — Demo Sequence

Runs:

```text
Normal
Normal
Port Scan
Brute Force
Anomaly
Suspicious HTTP
```

## Automated Testing

### Local

```powershell
cd backend

.\.venv\Scripts\Activate.ps1

pytest -q
```

### Docker

```powershell
docker compose exec backend pytest -q
```

Verified result:

```text
....                                             [100%]
4 passed in 2.90s
```

## Manual Test Results

### Port Scan

```text
Signature: PORT_SCAN
ML:        ANOMALY
Risk:      80
Level:     HIGH
```

### Brute Force

```text
Signature: BRUTE_FORCE
ML:        ANOMALY
Risk:      82
Level:     CRITICAL
```

### Suspicious HTTP

```text
Signature: SUSPICIOUS_HTTP
ML:        ANOMALY
Risk:      78
Level:     HIGH
```

### ML-Only Anomaly

```text
Signature: NOT DETECTED
ML:        ANOMALY
Risk:      16
Level:     LOW
```

### Full Hybrid Detection

```text
Signature: PORT_SCAN
ML:        ANOMALY
Risk:      99
Level:     CRITICAL
```

## Alert Management Test

Alert #6 was tested through:

```text
OPEN
  |
  v
ACKNOWLEDGED
  |
  v
RESOLVED
```

## Simulator Verification

The simulator was successfully tested with:

```text
Normal
Normal
Port Scan
Brute Force
Anomaly
Suspicious HTTP
```

The corrected anomaly scenario generated:

```text
Event ID: 13
Signature: False
ML: True
Anomaly Score: 16.69
Risk Score: 16
Risk Level: LOW
Alert: #11
```

## Verified System Status

```text
Backend API              ✓
FastAPI                  ✓
React Frontend           ✓
SQLite Database          ✓
Signature Engine         ✓
ML Anomaly Engine        ✓
Risk Correlation         ✓
Risk Scoring             ✓
Alert Generation         ✓
Alert Management         ✓
REST APIs                ✓
WebSocket                ✓
Security Dashboard       ✓
Event Simulator          ✓
Automated Tests          ✓
Docker Compose           ✓
Timestamp Conversion     ✓
```

Automated backend tests:

```text
4 passed
```

## Current Demonstration Database

The current database has intentionally been retained for demonstration and testing.

Current verified state:

```text
Events:
13

Alerts:
11

Critical Alerts:
5

Open Alerts:
10
```

The database has not been reset so previous test evidence remains available.

# Troubleshooting

## Backend Not Accessible

```powershell
docker compose ps
docker compose down
docker compose up -d
```

Then:

```text
http://localhost:8000/api/health
```

## Backend Logs

```powershell
docker compose logs backend
```

Follow live logs:

```powershell
docker compose logs -f backend
```

## Frontend Logs

```powershell
docker compose logs frontend
```

## Pytest Import Error

Make sure:

```text
backend/pytest.ini
```

contains:

```ini
[pytest]
pythonpath = .
testpaths = tests
```

Then:

```powershell
docker compose exec backend pytest -q
```

## Simulator Cannot Connect

Check:

```powershell
Invoke-RestMethod "http://localhost:8000/api/health"
```

Expected:

```text
status   : healthy
database : sqlite
```

Then:

```powershell
cd simulator
python simulator.py
```

# Security Scope

This project is an **educational defensive security prototype**.

The included simulator generates controlled JSON events rather than performing real attacks.

The system is intended for:

- Cybersecurity education
- IDS demonstrations
- Security monitoring research
- ML anomaly detection experimentation
- Academic mini-project demonstrations

Only use the system against networks, systems, and data for which you have appropriate authorization.

# Future Enhancements

Possible future improvements include:

- Real network packet capture
- Live network interface monitoring
- More signature rules
- Advanced attack classification
- PostgreSQL support
- Authentication
- Role-based access control
- Threat intelligence feeds
- Email notifications
- SMS notifications
- SIEM integration
- Model retraining pipeline
- Model performance metrics
- Historical analytics
- Geo/IP intelligence
- Production deployment
- Cloud deployment
- Container orchestration
- Advanced security reporting

# Quick Start

```powershell
docker compose up -d
docker compose ps
```

Open:

```text
Dashboard:
http://localhost:5173

API:
http://localhost:8000

Swagger:
http://localhost:8000/docs

Health:
http://localhost:8000/api/health
```

Run tests:

```powershell
docker compose exec backend pytest -q
```

Run simulator:

```powershell
cd simulator
python simulator.py
```

For the complete simulator demonstration:

```text
Select: 6
```

# Project Status

## Functionally Tested

The current prototype successfully demonstrates:

```text
                    Security Event
                           |
                           v
                     Event API
                           |
              +------------+------------+
              |                         |
              v                         v
       Signature Detection        ML Anomaly Detection
              |                         |
              +------------+------------+
                           |
                           v
                    Risk Correlation
                           |
                           v
                       Risk Score
                           |
                           v
                    Alert Generation
                           |
                           v
                         SQLite
                           |
                 +---------+---------+
                 |                   |
                 v                   v
              REST API           WebSocket
                 |                   |
                 +---------+---------+
                           |
                           v
                    React Dashboard
```

The system has been tested using:

- Manual API requests
- Port-scan events
- Brute-force events
- Suspicious HTTP events
- ML-only anomaly events
- Full hybrid events
- Alert status transitions
- Simulator-generated events
- Dashboard monitoring
- WebSocket connectivity
- Docker deployment
- Automated Pytest tests

**Automated test result:**

```text
4 passed
```

---

## Educational Project

**Hybrid Intrusion Detection & Security Monitoring System**

Educational defensive cybersecurity prototype.

```text
Signature Detection
        +
ML Anomaly Detection
        +
Risk Correlation
        +
Real-Time Monitoring
        =
Hybrid IDS
```
