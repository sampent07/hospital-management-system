import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.core.database import Base, get_utc_now


def generate_uuid():
    return str(uuid.uuid4())


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    employee_code = Column(String(50), nullable=True, unique=True)
    role = Column(String(20), nullable=False, default="PATIENT")  # ADMIN, COORDINATOR, DOCTOR, PATIENT
    status = Column(String(20), nullable=False, default="ACTIVE")  # PENDING, ACTIVE, REJECTED, DISABLED, DELETED
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    assigned_service_point_id = Column(String(36), ForeignKey("service_points.id"), nullable=True)

    staff_profile = relationship("StaffMember", back_populates="account", uselist=False)
    patient_profile = relationship("Patient", back_populates="account", uselist=False)


class StaffMember(Base):
    __tablename__ = "staff_members"

    id = Column(String(36), ForeignKey("accounts.id"), primary_key=True)
    staff_type = Column(String(30), nullable=False)  # DOCTOR, COORDINATOR, ADMIN
    phone_number = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)

    account = relationship("Account", back_populates="staff_profile")
    doctor_profile = relationship("Doctor", back_populates="staff_member", uselist=False)


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), ForeignKey("staff_members.id"), primary_key=True)
    specialty = Column(String(100), nullable=False)
    license_number = Column(String(50), nullable=False)

    staff_member = relationship("StaffMember", back_populates="doctor_profile")


class Authorization(Base):
    """Ủy quyền giữa Bác sĩ và Thư ký phòng khám."""
    __tablename__ = "authorizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    coordinator_id = Column(String(36), ForeignKey("staff_members.id"), nullable=False)
    scope = Column(String(255), nullable=False)
    started_at = Column(DateTime(timezone=True), nullable=False, default=get_utc_now)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")  # PENDING, ACTIVE, EXPIRED, REVOKED


class SystemLog(Base):
    """Nhật ký hệ thống bất biến - Tuyệt đối không UPDATE và không DELETE."""
    __tablename__ = "system_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), ForeignKey("accounts.id"), nullable=True)
    action_type = Column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, LOGIN, ROLE_CHANGE...
    target_type = Column(String(50), nullable=False)  # ACCOUNT, SERVICE_POINT, PACKAGE, VISIT...
    target_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
