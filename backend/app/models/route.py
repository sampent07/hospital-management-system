import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base, get_utc_now


def generate_uuid():
    return str(uuid.uuid4())


class Route(Base):
    """Lộ trình điều phối bệnh nhân."""
    __tablename__ = "routes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False, index=True)
    version = Column(Integer, nullable=False, default=1)
    creation_reason = Column(String(50), nullable=False, default="INITIAL")  # INITIAL, RECALC_REQUEST, OVERDUE_FALLBACK
    status = Column(String(20), nullable=False, default="ACTIVE")  # ACTIVE, REPLACED, REJECTED
    suggestion_source = Column(String(30), nullable=False, default="AI_RL")  # AI_RL, HEURISTIC_FALLBACK, MANUAL
    confidence = Column(Float, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    estimated_total_duration_seconds = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    visit = relationship("Visit", back_populates="routes")
    steps = relationship("RouteStep", back_populates="route", cascade="all, delete-orphan", order_by="RouteStep.step_order")
    decisions = relationship("RouteDecision", back_populates="route")


class RouteStep(Base):
    """Các bước trong một lộ trình khám."""
    __tablename__ = "route_steps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_id = Column(String(36), ForeignKey("routes.id"), nullable=False, index=True)
    visit_progress_id = Column(String(36), ForeignKey("visit_progress.id"), nullable=False)
    step_order = Column(Integer, nullable=False)
    estimated_wait_seconds = Column(Integer, nullable=False, default=0)
    estimated_service_seconds = Column(Integer, nullable=False, default=0)

    route = relationship("Route", back_populates="steps")
    visit_progress = relationship("VisitProgress")


class RouteDecision(Base):
    """Nhật ký quyết định lộ trình bất biến - Bệnh nhân hoặc nhân viên thao tác hộ xác nhận."""
    __tablename__ = "route_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    route_id = Column(String(36), ForeignKey("routes.id"), nullable=False)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False)
    decision_type = Column(String(20), nullable=False)  # ACCEPTED_NEW, KEPT_EXISTING, REJECTED
    decided_by_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    is_proxy_action = Column(Boolean, nullable=False, default=False)
    decided_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    route = relationship("Route", back_populates="decisions")
