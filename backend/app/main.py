from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import init_db
from app.api.events import router as events_router
from app.api.alerts import router as alerts_router
from app.api.dashboard import router as dashboard_router
from app.api.health import router as health_router
from app.websocket.manager import manager

app = FastAPI(title="Hybrid IDS & Security Monitoring System", version="1.0.0",
              description="Educational hybrid intrusion detection and security monitoring prototype.")

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(health_router)
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(dashboard_router)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def root():
    return {"system":"Hybrid IDS","status":"online","version":"1.0.0","docs":"/docs"}

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket:WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except Exception:
        manager.disconnect(websocket)
