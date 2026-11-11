import uuid
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class ServicePoint(Base):
    """Điểm dịch vụ (phòng khám, phòng xét nghiệm, chụp chiếu, lễ tân)."""
    __tablename__ = "service_points"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    room_number = Column(String(50), nullable=True)
    resource_count = Column(Integer, nullable=False, default=1)  # Số bàn khám / bác sĩ đồng thời
    avg_service_duration_seconds = Column(Integer, nullable=False, default=600)  # Thời gian phục vụ TB (10 phút)
    queue_capacity = Column(Integer, nullable=False, default=50)  # Sức chứa hàng đợi tối đa
    result_wait_duration_seconds = Column(Integer, nullable=False, default=0)  # Thời gian chờ kết quả
    status = Column(String(20), nullable=False, default="ACTIVE")

    exam_services = relationship("ExamService", back_populates="default_service_point")


class ExamService(Base):
    """Dịch vụ khám (trước đây gọi là hoạt động khám)."""
    __tablename__ = "exam_services"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)  # Lâm sàng, Cận lâm sàng, Xét nghiệm...
    description = Column(Text, nullable=True)
    has_result_waiting = Column(Boolean, nullable=False, default=False)
    default_service_point_id = Column(String(36), ForeignKey("service_points.id"), nullable=False)
    status = Column(String(20), nullable=False, default="ACTIVE")

    default_service_point = relationship("ServicePoint", back_populates="exam_services")
