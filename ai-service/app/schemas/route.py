from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ActivityItem(BaseModel):
    service_id: str
    service_point_id: str
    progress_id: Optional[str] = None


class RecalculateRouteRequest(BaseModel):
    patient_state: Dict[str, Any] = Field(..., description="Trạng thái bệnh nhân: {is_priority, visit_id, ...}")
    valid_activities: List[ActivityItem] = Field(..., description="Danh sách các dịch vụ hợp lệ do Backend gửi sang")
    queue_metrics: Dict[str, Any] = Field(..., description="Chỉ số hàng đợi hiện tại của các điểm dịch vụ")


class RouteStepItem(BaseModel):
    service_id: str
    step_order: int
    estimated_wait_seconds: int
    estimated_service_seconds: int


class RecalculateRouteResponse(BaseModel):
    model_version: str
    suggestion_source: str = "AI_RL"
    method_label: str = "Học tăng cường (RL Inference)"
    confidence: float
    estimated_total_duration_seconds: int
    steps: List[RouteStepItem]
    is_fallback: bool = False
