import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base, get_utc_now


def generate_uuid():
    return str(uuid.uuid4())


class Visit(Base):
    """Lượt khám bệnh nhân."""
    __tablename__ = "visits"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_code = Column(String(50), unique=True, nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=True)
    company_registration_id = Column(String(36), ForeignKey("company_package_registrations.id"), nullable=True)
    visit_type = Column(String(30), nullable=False, default="PACKAGE")  # PACKAGE, SYMPTOM_ORDER
    reception_channel = Column(String(30), nullable=False, default="COUNTER")  # KIOSK, COUNTER, APP
    is_priority = Column(Boolean, nullable=False, default=False)  # Bệnh nhân ưu tiên
    queue_number = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="REGISTERED")  # REGISTERED, IN_PROGRESS, COMPLETED, CANCELLED
    check_in_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_by_id = Column(String(36), ForeignKey("accounts.id"), nullable=True)

    patient = relationship("Patient", back_populates="visits")
    package = relationship("Package")
    progress_items = relationship("VisitProgress", back_populates="visit", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="visit", cascade="all, delete-orphan")


class VisitProgress(Base):
    """Tiến độ dịch vụ của lượt khám (Vòng đời: NOT_STARTED -> WAITING -> IN_PROGRESS -> COMPLETED).
    
    Có cột `version` cho khóa lạc quan (optimistic lock) chống race condition.
    """
    __tablename__ = "visit_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False, index=True)
    exam_service_id = Column(String(36), ForeignKey("exam_services.id"), nullable=False, index=True)
    service_point_id = Column(String(36), ForeignKey("service_points.id"), nullable=False, index=True)
    service_source = Column(String(20), nullable=False, default="PACKAGE")  # PACKAGE, DOCTOR_ORDER
    status = Column(String(20), nullable=False, default="NOT_STARTED", index=True)  # NOT_STARTED, WAITING, IN_PROGRESS, COMPLETED
    assigned_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    queued_at = Column(DateTime(timezone=True), nullable=True, index=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    performed_by_id = Column(String(36), ForeignKey("accounts.id"), nullable=True)
    is_proxy_action = Column(Boolean, nullable=False, default=False)
    version = Column(Integer, nullable=False, default=1)  # Optimistic Locking!

    visit = relationship("Visit", back_populates="progress_items")
    exam_service = relationship("ExamService")
    service_point = relationship("ServicePoint")

    __table_args__ = (
        Index("idx_progress_service_status_queued", "service_point_id", "status", "queued_at"),
    )
