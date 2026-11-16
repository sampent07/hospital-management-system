from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AppointmentCreate(BaseModel):
    patient_id: str = Field(..., description="ID bệnh nhân")
    package_id: Optional[str] = Field(None, description="ID gói khám đăng ký trước nếu có")
    appointment_time: datetime = Field(..., description="Thời gian hẹn (UTC)")
    appointment_type: str = Field("FIRST_VISIT", description="FIRST_VISIT, FOLLOW_UP, PERIODIC")
    notes: Optional[str] = Field(None, description="Ghi chú triệu chứng hoặc dặn dò tái khám")


class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., description="SCHEDULED, CONFIRMED, CHECKED_IN, CANCELLED")


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    patient_phone: str
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    appointment_time: datetime
    appointment_type: str
    notes: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
