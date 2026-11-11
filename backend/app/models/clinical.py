import uuid
from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base, get_utc_now


def generate_uuid():
    return str(uuid.uuid4())


class ExamResult(Base):
    """Kết quả khám cận lâm sàng / chẩn đoán hình ảnh."""
    __tablename__ = "exam_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_progress_id = Column(String(36), ForeignKey("visit_progress.id"), nullable=False)
    result_content = Column(Text, nullable=False)
    attachment_url = Column(String(255), nullable=True)
    recorded_by_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    recorded_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class Diagnosis(Base):
    """Chẩn đoán bệnh của Bác sĩ."""
    __tablename__ = "diagnoses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    icd10_code = Column(String(20), nullable=True)
    diagnosis_description = Column(Text, nullable=False)
    diagnosed_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class TreatmentPlan(Base):
    """Kế hoạch điều trị."""
    __tablename__ = "treatment_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    plan_content = Column(Text, nullable=False)
    started_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    estimated_duration_days = Column(Integer, nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")


class Prescription(Base):
    """Đơn thuốc."""
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    prescribed_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    doctor_advice = Column(Text, nullable=True)

    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")


class PrescriptionItem(Base):
    """Chi tiết từng loại thuốc trong đơn."""
    __tablename__ = "prescription_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=False)
    drug_name = Column(String(150), nullable=False)
    dosage = Column(String(50), nullable=False)
    unit = Column(String(20), nullable=False)
    quantity = Column(Integer, nullable=False)
    usage_instructions = Column(Text, nullable=False)

    prescription = relationship("Prescription", back_populates="items")


class Conclusion(Base):
    """Kết luận lượt khám."""
    __tablename__ = "conclusions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    visit_id = Column(String(36), ForeignKey("visits.id"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    conclusion_text = Column(Text, nullable=False)
    doctor_recommendation = Column(Text, nullable=True)
    concluded_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


class Notification(Base):
    """Thông báo gửi tới bệnh nhân hoặc nhân viên."""
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False)
    notification_type = Column(String(50), nullable=False)  # QUEUE_TURN, ROUTE_PROPOSED, RESULT_READY...
    content = Column(Text, nullable=False)
    channel = Column(String(20), nullable=False, default="IN_APP")  # IN_APP, SMS_MOCK, WEBSOCKET
    status = Column(String(20), nullable=False, default="SENT")
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
