from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import require_permission, get_current_user_payload
from app.services.appointment_service import AppointmentService
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentStatusUpdate,
    AppointmentResponse,
)

router = APIRouter(prefix="/appointments", tags=["Quản lý Lịch hẹn & Tái khám"])


@router.get("", response_model=List[AppointmentResponse], summary="Xem danh sách lịch hẹn khám")
def list_appointments(
    status: Optional[str] = Query(None, description="Lọc theo trạng thái: SCHEDULED, CONFIRMED, CHECKED_IN, CANCELLED"),
    patient_id: Optional[str] = Query(None, description="Lọc theo ID bệnh nhân"),
    payload: dict = Depends(require_permission("appointment:manage")),
    db: Session = Depends(get_db)
):
    service = AppointmentService(db)
    return service.list_appointments(status=status, patient_id=patient_id)


@router.post("", response_model=AppointmentResponse, summary="Đặt lịch hẹn hoặc hẹn tái khám")
def create_appointment(
    req: AppointmentCreate,
    payload: dict = Depends(require_permission("appointment:manage")),
    db: Session = Depends(get_db)
):
    service = AppointmentService(db)
    return service.create_appointment(req)


@router.put("/{appointment_id}/status", response_model=AppointmentResponse, summary="Cập nhật trạng thái lịch hẹn")
def update_appointment_status(
    appointment_id: str,
    req: AppointmentStatusUpdate,
    payload: dict = Depends(require_permission("appointment:manage")),
    db: Session = Depends(get_db)
):
    service = AppointmentService(db)
    return service.update_appointment_status(appointment_id, req.status)
