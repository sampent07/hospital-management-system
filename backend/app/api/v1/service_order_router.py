from typing import List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, get_utc_now
from app.core.permissions import require_permission
from app.core.exceptions import ResourceNotFound
from app.models.visit import Visit, VisitProgress
from app.models.service import ExamService
from app.schemas.visit import VisitProgressResponse

router = APIRouter(prefix="/service-orders", tags=["Chỉ định dịch vụ (Bác sĩ)"])


class DoctorServiceOrderRequest(BaseModel):
    visit_id: str
    service_ids: List[str] = Field(..., min_items=1, description="Danh sách mã ID dịch vụ khám được bác sĩ chỉ định thêm")


@router.post("", response_model=List[VisitProgressResponse], summary="Bác sĩ chỉ định dịch vụ khám bổ sung")
def order_additional_services(
    req: DoctorServiceOrderRequest,
    payload: dict = Depends(require_permission("service_order:create")),
    db: Session = Depends(get_db)
):
    """CHỈ ĐỊNH DỊCH VỤ - ĐẶC QUYỀN DUY NHẤT CỦA BÁC SĨ (DOCTOR).
    
    Tạo các tiến độ dịch vụ mới với nguồn là DOCTOR_ORDER.
    """
    visit = db.query(Visit).filter(Visit.id == req.visit_id).first()
    if not visit:
        raise ResourceNotFound("Visit", req.visit_id)

    created_progress = []
    now = get_utc_now()
    doctor_account_id = payload.get("sub")

    for sid in req.service_ids:
        es = db.query(ExamService).filter(ExamService.id == sid).first()
        if not es:
            continue

        progress = VisitProgress(
            visit_id=visit.id,
            exam_service_id=es.id,
            service_point_id=es.default_service_point_id,
            service_source="DOCTOR_ORDER",
            status="NOT_STARTED",
            assigned_at=now,
            performed_by_id=doctor_account_id,
            version=1
        )
        db.add(progress)
        created_progress.append(progress)

    db.commit()
    for cp in created_progress:
        db.refresh(cp)

    return created_progress
