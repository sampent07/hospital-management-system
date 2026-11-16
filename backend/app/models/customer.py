import uuid
import secrets
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Text, Integer, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base, get_utc_now


def generate_uuid():
    return str(uuid.uuid4())


def generate_patient_code():
    return f"BN-{secrets.token_hex(6).upper()}"


class Patient(Base):
    """Thông tin bệnh nhân."""
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=True)
    patient_code = Column(String(40), unique=True, nullable=False, default=generate_patient_code, index=True)
    full_name = Column(String(100), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)  # MALE, FEMALE, OTHER
    marital_status = Column(String(20), nullable=True)  # SINGLE, MARRIED, DIVORCED
    phone_number = Column(String(20), nullable=False, index=True)
    country = Column(String(100), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    id_card_number = Column(String(30), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)

    account = relationship("Account", back_populates="patient_profile")
    visits = relationship("Visit", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")


class PatientProfileLinkVerification(Base):
    """Mã OTP demo dùng một lần để liên kết hồ sơ bệnh nhân với tài khoản."""
    __tablename__ = "patient_profile_link_verifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)


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


class DoctorSchedule(Base):
    """Lịch khám / Lịch làm việc của Bác sĩ (LICHKHAM trong ERD)."""
    __tablename__ = "doctor_schedules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    service_point_id = Column(String(36), ForeignKey("service_points.id"), nullable=False)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=True)  # Gói khám tương thích
    work_date = Column(Date, nullable=False, index=True)  # NgayThang
    start_time = Column(String(10), nullable=False)  # TGBatDau e.g. "07:30"
    end_time = Column(String(10), nullable=False)  # TGKetThuc e.g. "08:30"
    max_slots = Column(Integer, nullable=False, default=10)  # SLToiDa
    current_booked = Column(Integer, nullable=False, default=0)  # SLHienTai
    status = Column(String(20), nullable=False, default="AVAILABLE")  # AVAILABLE, FULL, OFF, CANCELLED

    doctor = relationship("Doctor")
    service_point = relationship("ServicePoint")
    package = relationship("Package")
    appointments = relationship("Appointment", back_populates="schedule")


class Appointment(Base):
    """Lịch hẹn khám (LICHHEN trong ERD)."""
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=True)
    doctor_schedule_id = Column(String(36), ForeignKey("doctor_schedules.id"), nullable=True)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=True)
    appointment_time = Column(DateTime(timezone=True), nullable=False)
    appointment_type = Column(String(30), nullable=False, default="FIRST_VISIT")
    package_registration_id = Column(String(36), ForeignKey("patient_package_registrations.id"), nullable=True, unique=True)
    appointment_code = Column(String(40), unique=True, nullable=True, index=True)
    notes = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="SCHEDULED")  # SCHEDULED, CONFIRMED, CHECKED_IN, CANCELLED

    schedule = relationship("DoctorSchedule", back_populates="appointments")


class PatientVerification(Base):
    """Trạng thái xác minh demo khi bệnh nhân tự đăng ký tài khoản."""
    __tablename__ = "patient_verifications"

    account_id = Column(String(36), ForeignKey("accounts.id"), primary_key=True)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)


class PatientPackageRegistration(Base):
    """Đăng ký gói cá nhân, duyệt và thanh toán giả lập."""
    __tablename__ = "patient_package_registrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=False)
    price_snapshot = Column(Numeric(12, 2), nullable=False)
    status = Column(String(30), nullable=False, default="PENDING_APPROVAL")
    requested_at = Column(DateTime(timezone=True), default=get_utc_now, nullable=False)
    reviewed_by_id = Column(String(36), ForeignKey("accounts.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_method = Column(String(20), nullable=True)

    patient = relationship("Patient")
    package = relationship("Package")


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
