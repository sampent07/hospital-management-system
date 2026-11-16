from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MedicalRecordCreate(BaseModel):
    medical_history: Optional[str] = Field(None, description="Tiền sử bệnh lý bản thân")
    family_history: Optional[str] = Field(None, description="Tiền sử gia đình")
    allergies: Optional[str] = Field(None, description="Dị ứng thuốc / thực phẩm")


class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    medical_history: Optional[str] = None
    family_history: Optional[str] = None
    allergies: Optional[str] = Field(None)
    created_at: datetime

    class Config:
        from_attributes = True


class PatientCreate(BaseModel):
    full_name: str = Field(..., description="Họ và tên bệnh nhân")
    date_of_birth: date = Field(..., description="Ngày tháng năm sinh")
    gender: str = Field(..., description="MALE, FEMALE hoặc OTHER")
    phone_number: str = Field(..., description="Số điện thoại liên hệ")
    email: Optional[str] = None
    address: Optional[str] = None
    id_card_number: Optional[str] = None
    marital_status: Optional[str] = "SINGLE"


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    id_card_number: Optional[str] = None
    marital_status: Optional[str] = None


class PatientResponse(BaseModel):
    id: str
    full_name: str
    date_of_birth: date
    gender: str
    marital_status: Optional[str] = None
    phone_number: str
    email: Optional[str] = None
    address: Optional[str] = None
    id_card_number: Optional[str] = None
    created_at: datetime
    medical_records: List[MedicalRecordResponse] = []

    class Config:
        from_attributes = True
