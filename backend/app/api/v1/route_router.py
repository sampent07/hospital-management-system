from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import get_current_user_payload
from app.services.route_service import RouteService
from app.schemas.route import (
    RouteResponse,
    RouteRecalculateRequest,
    RouteDecisionRequest,
)
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/routes", tags=["Lộ trình thông minh"])


@router.post("/visits/{visit_id}/initial", response_model=RouteResponse, summary="Sinh lộ trình ban đầu khi bắt đầu khám")
async def generate_initial_route(
    visit_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = RouteService(db)
    return await service.calculate_or_recalculate_route(
        visit_id,
        is_initial=True,
        actor_id=payload.get("sub")
    )


@router.post("/visits/{visit_id}/recalculate", response_model=RouteResponse, summary="Yêu cầu tính lại lộ trình tối ưu")
async def recalculate_route(
    visit_id: str,
    req: RouteRecalculateRequest,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Tính lại lộ trình theo yêu cầu của bệnh nhân hoặc nhân viên hỗ trợ.
    
    Chỉ đề xuất lộ trình mới nếu tiết kiệm >= 3 phút và đúng ràng buộc.
    """
    service = RouteService(db)
    return await service.calculate_or_recalculate_route(
        visit_id,
        is_initial=False,
        actor_id=payload.get("sub"),
        is_proxy=req.is_proxy_action
    )


@router.post("/{route_id}/decision", response_model=MessageResponse, summary="Ghi nhận quyết định lộ trình của bệnh nhân")
def decide_route(
    route_id: str,
    req: RouteDecisionRequest,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Bệnh nhân xác nhận chấp nhận lộ trình mới (ACCEPTED_NEW) hoặc giữ lộ trình cũ (KEPT_EXISTING).
    
    Quyết định được lưu vào bảng nhật ký bất biến.
    """
    service = RouteService(db)
    service.record_decision(route_id, req, actor_id=payload.get("sub"))
    return MessageResponse(success=True, message=f"Đã ghi nhận quyết định '{req.decision_type}' thành công.")
