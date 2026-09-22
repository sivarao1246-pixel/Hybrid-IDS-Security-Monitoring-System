from datetime import datetime, timezone
from typing import Any
from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, Integer, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column
from app.database.database import Base

class SecurityEvent(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source_ip: str
    destination_ip: str | None = None
    source_port: int | None = None
    destination_port: int | None = None
    protocol: str | None = None
    packet_count: int = Field(default=1, ge=0)
    byte_count: int = Field(default=0, ge=0)
    event_type: str = "NETWORK"
    failed_logins: int = Field(default=0, ge=0)
    metadata: dict[str, Any] = Field(default_factory=dict)

class EventRecord(Base):
    __tablename__ = "events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    source_ip = Column(String(64), nullable=False, index=True)
    destination_ip = Column(String(64))
    source_port = Column(Integer)
    destination_port = Column(Integer)
    protocol = Column(String(16))
    packet_count = Column(Integer, default=1)
    byte_count = Column(Integer, default=0)
    event_type = Column(String(64), default="NETWORK")
    failed_logins = Column(Integer, default=0)
    metadata_json = Column(Text, default="{}")

class AlertRecord(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    event_id = Column(Integer, nullable=True)
    source_ip = Column(String(64), nullable=False, index=True)
    threat_type = Column(String(64), nullable=False)
    severity = Column(String(16), nullable=False)
    risk_score = Column(Integer, nullable=False)
    status = Column(String(16), default="OPEN")
    rule_id = Column(String(64))
    description = Column(Text)
    anomaly_score = Column(Float, default=0.0)
