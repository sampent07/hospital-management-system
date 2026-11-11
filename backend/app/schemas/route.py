from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class RouteStepResponse(BaseModel):
    id: str
    visit_progress_id: str
    step_order: int
    service_id: str
    service_name: str
    service_point_id: str
    service_point_name: str
    room_number: Optional[str] = None
    status: str
    estimated_wait_seconds: int
    estimated_service_seconds: int

    class Config:
        from_attributes = True


class RouteResponse(BaseModel):
    id: str
    visit_id: str
    version: int
    creation_reason: str
    status: str
    suggestion_source: str
    confidence: Optional[float] = None
    latency_ms: Optional[int] = None
    estimated_total_duration_seconds: int
    created_at: datetime
    steps: List[RouteStepResponse] = []
    is_better: bool = True
    improvement_minutes: int = 0
    message: Optional[str] = None

    class Config:
        from_attributes = True


class RouteRecalculateRequest(BaseModel):
    force_fallback: bool = False
    requested_by_id: Optional[str] = None
    is_proxy_action: bool = False


class RouteDecisionRequest(BaseModel):
    decision_type: str = Field(..., description="ACCEPTED_NEW hoặc KEPT_EXISTING")
    is_proxy_action: bool = False
