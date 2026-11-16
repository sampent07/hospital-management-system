from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AuthorizationCreate(BaseModel):
    coordinator_id: str = Field(..., description="ID tài khoản Thư ký được ủy quyền")
    scope: str = Field(..., description="Phạm vi ủy quyền (ví dụ: Tiếp nhận bệnh nhân & Hỗ trợ lộ trình, Ghi nhận kết quả)")
    ended_at: Optional[datetime] = Field(None, description="Thời điểm hết hiệu lực ủy quyền (UTC)")


class AuthorizationResponse(BaseModel):
    id: str
    doctor_id: str
    doctor_name: str
    coordinator_id: str
    coordinator_name: str
    scope: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    accepted_at: Optional[datetime] = None
    status: str  # PENDING, ACTIVE, EXPIRED, REVOKED

    class Config:
        from_attributes = True
