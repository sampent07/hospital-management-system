import uuid
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base, get_utc_now


def generate_uuid():
    return str(uuid.uuid4())


class Patient(Base):
    """Thông tin bệnh nhân."""
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=True)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)  # MALE, FEMALE, OTHER
    marital_status = Column(String(20), nullable=True)  # SINGLE, MARRIED, DIVORCED
    phone_number = Column(String(20), nullable=False, index=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    id_card_number = Column(String(30), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    account = relationship("Account", back_populates="patient_profile")
    visits = relationship("Visit", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")


class Company(Base):
    """Khách hàng Doanh nghiệp."""
    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    tax_code = Column(String(50), nullable=False)
    contact_person = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")

    package_registrations = relationship("CompanyPackageRegistration", back_populates="company")


class CompanyPackageRegistration(Base):
    """Doanh nghiệp đăng ký gói khám cho nhân viên."""
    __tablename__ = "company_package_registrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=False)
    target_group = Column(String(100), nullable=False)
    quantity_registered = Column(Integer, nullable=False)
    registered_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(20), nullable=False, default="ACTIVE")

    company = relationship("Company", back_populates="package_registrations")
    package = relationship("Package")


class Appointment(Base):
    """Lịch hẹn khám."""
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=True)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    appointment_type = Column(String(30), nullable=False, default="FIRST_VISIT")
    notes = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="SCHEDULED")  # SCHEDULED, CONFIRMED, CHECKED_IN, CANCELLED


class MedicalRecord(Base):
    """Hồ sơ bệnh án cơ bản."""
    __tablename__ = "medical_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    medical_history = Column(Text, nullable=True)
    family_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    patient = relationship("Patient", back_populates="medical_records")
