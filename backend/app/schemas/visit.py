from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class StatusTransitionRequest(BaseModel):
    new_status: str = Field(..., description="WAITING, IN_PROGRESS, hoặc COMPLETED")
    performed_by_id: Optional[str] = None
    is_proxy_action: bool = False
    expected_version: int = Field(..., description="Phiên bản hiện tại để khóa lạc quan (Optimistic Lock)")


class VisitProgressResponse(BaseModel):
    id: str
    visit_id: str
    exam_service_id: str
    service_name: Optional[str] = None
    service_point_id: str
    service_point_name: Optional[str] = None
    service_source: str
    status: str
    assigned_at: datetime
    queued_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    version: int

    class Config:
        from_attributes = True


class VisitCreateRequest(BaseModel):
    patient_id: str
    package_id: Optional[str] = None
    visit_type: str = "PACKAGE"  # PACKAGE, SYMPTOM_ORDER
    reception_channel: str = "COUNTER"  # KIOSK, COUNTER, APP
    is_priority: bool = False


class VisitResponse(BaseModel):
    id: str
    visit_code: str
    patient_id: str
    patient_name: Optional[str] = None
    package_id: Optional[str] = None
    package_name: Optional[str] = None
    visit_type: str
    reception_channel: str
    is_priority: bool
    queue_number: int
    status: str
    check_in_at: datetime
    completed_at: Optional[datetime] = None
    progress_items: List[VisitProgressResponse] = []

    class Config:
        from_attributes = True
