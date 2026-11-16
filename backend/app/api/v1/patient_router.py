from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import require_permission
from app.services.patient_service import PatientService
from app.schemas.patient import (
    PatientCreate,
    PatientUpdate,
    PatientResponse,
    MedicalRecordCreate,
    MedicalRecordResponse,
)

router = APIRouter(prefix="/patients", tags=["Quản lý Bệnh nhân & Hồ sơ"])


@router.get("", response_model=List[PatientResponse], summary="Tìm kiếm và tra cứu bệnh nhân")
def search_patients(
    q: Optional[str] = Query(None, description="Từ khóa: Họ tên, SĐT, CCCD"),
    limit: int = Query(50, ge=1, le=100),
    payload: dict = Depends(require_permission("patient:manage")),
    db: Session = Depends(get_db)
):
    service = PatientService(db)
    return service.search_patients(query=q, limit=limit)


@router.post("", response_model=PatientResponse, summary="Tạo hồ sơ bệnh nhân mới")
def create_patient(
    req: PatientCreate,
    payload: dict = Depends(require_permission("patient:manage")),
    db: Session = Depends(get_db)
):
    service = PatientService(db)
    return service.create_patient(req)


@router.get("/{patient_id}", response_model=PatientResponse, summary="Chi tiết bệnh nhân và tiền sử bệnh")
def get_patient(
    patient_id: str,
    payload: dict = Depends(require_permission("patient:manage")),
    db: Session = Depends(get_db)
):
    service = PatientService(db)
    return service.get_patient_by_id(patient_id)


@router.put("/{patient_id}", response_model=PatientResponse, summary="Cập nhật thông tin hành chính bệnh nhân")
def update_patient(
    patient_id: str,
    req: PatientUpdate,
    payload: dict = Depends(require_permission("patient:manage")),
    db: Session = Depends(get_db)
):
    service = PatientService(db)
    return service.update_patient(patient_id, req)


@router.post("/{patient_id}/medical-records", response_model=MedicalRecordResponse, summary="Ghi nhận tiền sử bệnh lý và dị ứng")
def add_medical_record(
    patient_id: str,
    req: MedicalRecordCreate,
    payload: dict = Depends(require_permission("patient:manage")),
    db: Session = Depends(get_db)
):
    service = PatientService(db)
    return service.add_medical_record(patient_id, req)
