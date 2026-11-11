from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.permissions import require_permission, get_current_user_payload
from app.services.visit_service import VisitService
from app.schemas.visit import (
    VisitCreateRequest,
    VisitResponse,
    VisitProgressResponse,
    StatusTransitionRequest,
)
from app.schemas.common import MessageResponse

router = APIRouter(prefix="/visits", tags=["Lượt khám & Tiến độ dịch vụ"])


@router.post("", response_model=VisitResponse, summary="Tiếp nhận bệnh nhân / Tạo lượt khám mới")
def create_visit(
    req: VisitCreateRequest,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = VisitService(db)
    visit = service.create_visit(req, creator_id=payload.get("sub"))
    return visit


@router.get("/{visit_id}", response_model=VisitResponse, summary="Xem chi tiết lượt khám và tiến độ")
def get_visit_detail(visit_id: str, db: Session = Depends(get_db)):
    service = VisitService(db)
    visit = service.visit_repo.get_visit_with_details(visit_id)
    if not visit:
        from app.core.exceptions import ResourceNotFound
        raise ResourceNotFound("Visit", visit_id)
    return visit


@router.put("/progress/{progress_id}/status", response_model=VisitProgressResponse, summary="Cập nhật trạng thái dịch vụ")
async def update_progress_status(
    progress_id: str,
    req: StatusTransitionRequest,
    payload: dict = Depends(require_permission("progress:update_status")),
    db: Session = Depends(get_db)
):
    """Chuyển trạng thái dịch vụ (NOT_STARTED -> WAITING -> IN_PROGRESS -> COMPLETED).
    
    Yêu cầu gửi expected_version để kiểm tra Optimistic Locking.
    """
    service = VisitService(db)
    progress = await service.update_progress_status(
        progress_id,
        req,
        actor_id=payload.get("sub")
    )
    return progress


@router.post("/progress/{progress_id}/undo", response_model=VisitProgressResponse, summary="Hoàn tác trạng thái dịch vụ trong 60s")
async def undo_progress_status(
    progress_id: str,
    payload: dict = Depends(require_permission("progress:undo")),
    db: Session = Depends(get_db)
):
    service = VisitService(db)
    return await service.undo_status_transition(progress_id, actor_id=payload.get("sub"))
