from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PatientRegistrationRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    gender: str = Field(pattern="^(MALE|FEMALE|OTHER)$")
    marital_status: Optional[str] = Field(default=None, pattern="^(SINGLE|MARRIED|DIVORCED)$")
    phone_number: str = Field(min_length=7, max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = None

    @field_validator("date_of_birth")
    @classmethod
    def validate_birth_date(cls, value: date) -> date:
        if value >= datetime.now(timezone.utc).date():
            raise ValueError("Ngày sinh phải trước ngày hiện tại.")
        return value


class PatientRegistrationResponse(BaseModel):
    account_id: str
    username: str
    verification_required: bool
    demo_verification_code: str
    expires_at: datetime


class PatientVerificationRequest(BaseModel):
    username: str
    code: str = Field(min_length=6, max_length=6, pattern="^[0-9]{6}$")


class PatientProfileResponse(BaseModel):
    id: str
    account_id: Optional[str] = None
    patient_code: str
    full_name: str
    date_of_birth: date
    gender: str
    marital_status: Optional[str] = None
    phone_number: str
    country: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    id_card_number: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PatientProfileCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    gender: str = Field(pattern="^(MALE|FEMALE|OTHER)$")
    phone_number: str = Field(min_length=7, max_length=20)
    id_card_number: Optional[str] = Field(default=None, max_length=30)
    country: Optional[str] = Field(default="Việt Nam", max_length=100)
    email: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = None
    marital_status: Optional[str] = Field(default=None, pattern="^(SINGLE|MARRIED|DIVORCED)$")

    @field_validator("date_of_birth")
    @classmethod
    def validate_birth_date(cls, value: date) -> date:
        if value >= datetime.now(timezone.utc).date():
            raise ValueError("Ngày sinh phải trước ngày hiện tại.")
        return value


class LinkPatientByCodeRequest(BaseModel):
    patient_code: str = Field(min_length=3, max_length=50)


class PatientLookupRequest(BaseModel):
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    full_name: Optional[str] = None
    phone_number: str = Field(min_length=7, max_length=20)
    gender: Optional[str] = Field(default=None, pattern="^(MALE|FEMALE|OTHER)$")
    country: Optional[str] = "Việt Nam"
    id_card_number: Optional[str] = None


class PatientProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(default=None, pattern="^(MALE|FEMALE|OTHER)$")
    marital_status: Optional[str] = Field(default=None, pattern="^(SINGLE|MARRIED|DIVORCED)$")
    phone_number: Optional[str] = Field(default=None, min_length=7, max_length=20)
    email: Optional[str] = Field(default=None, max_length=100)
    address: Optional[str] = None
    id_card_number: Optional[str] = Field(default=None, max_length=30)


class PackageRegistrationCreate(BaseModel):
    package_id: str


class PackageRegistrationResponse(BaseModel):
    id: str
    patient_id: str
    package_id: str
    package_name: str
    price_snapshot: Decimal
    status: str
    requested_at: datetime
    reviewed_by_id: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    payment_method: Optional[str] = None


class PatientPackageApprovalResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    package_id: str
    package_name: str
    price_snapshot: Decimal
    status: str
    requested_at: datetime


class AppointmentCreateRequest(BaseModel):
    package_registration_id: Optional[str] = None
    patient_id: Optional[str] = None
    package_id: Optional[str] = None
    doctor_schedule_id: Optional[str] = None
    appointment_time: datetime
    notes: Optional[str] = None


class DoctorScheduleSlotResponse(BaseModel):
    id: str
    doctor_id: str
    doctor_name: str
    specialty: str
    service_point_id: str
    room_number: Optional[str] = None
    room_name: Optional[str] = None
    work_date: date
    start_time: str
    end_time: str
    max_slots: int
    current_booked: int
    remaining_slots: int
    status: str  # AVAILABLE, FULL, OFF, CANCELLED

    model_config = ConfigDict(from_attributes=True)


class DayAvailabilityResponse(BaseModel):
    date: str  # YYYY-MM-DD
    status: str  # AVAILABLE (Xanh), FULL (Vàng), UNAVAILABLE (Xám)
    total_slots: int
    remaining_slots: int
    slots: List[DoctorScheduleSlotResponse] = []


class PackageAvailableSchedulesResponse(BaseModel):
    package_id: str
    package_name: str
    month: str  # YYYY-MM
    days: List[DayAvailabilityResponse]


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: Optional[str] = None
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    specialty: Optional[str] = None
    room_number: Optional[str] = None
    room_name: Optional[str] = None
    doctor_schedule_id: Optional[str] = None
    appointment_time: datetime
    appointment_type: str
    appointment_code: str
    qr_payload: str
    status: str  # CONFIRMED, CHECKED_IN (Đã dùng), EXPIRED (Hết hạn), CANCELLED (Đã hủy)

    model_config = ConfigDict(from_attributes=True)


class CheckInRequest(BaseModel):
    appointment_code: str = Field(min_length=8, max_length=40)
