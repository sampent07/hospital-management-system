from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Tên đăng nhập")
    password: str = Field(..., description="Mật khẩu")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str
    full_name: str
    account_id: str


class RegisterStaffRequest(BaseModel):
    username: str
    password: str
    full_name: str
    employee_code: str
    staff_type: str = Field(..., description="DOCTOR hoặc COORDINATOR")
    specialty: Optional[str] = None
    license_number: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None


class AccountResponse(BaseModel):
    id: str
    username: str
    full_name: str
    role: str
    status: str
    employee_code: Optional[str] = None
    created_at: datetime
    last_login_at: Optional[datetime] = None
    assigned_service_point_id: Optional[str] = None

    class Config:
        from_attributes = True
