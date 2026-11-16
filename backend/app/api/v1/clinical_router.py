from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import require_permission, get_current_user_payload
from app.services.clinical_service import ClinicalService
from app.schemas.clinical import (
    ExamResultCreate,
    ExamResultResponse,
    DiagnosisCreate,
    DiagnosisResponse,
    PrescriptionCreate,
    PrescriptionResponse,
    TreatmentPlanCreate,
    TreatmentPlanResponse,
    ConclusionCreate,
    ConclusionResponse,
    VisitSummaryResponse,
)

router = APIRouter(prefix="/clinical", tags=["Khám lâm sàng, Chẩn đoán & Điều trị"])


# 1. Ghi nhận & Xem kết quả cận lâm sàng
@router.post("/exam-results", response_model=ExamResultResponse, summary="Ghi nhận kết quả cận lâm sàng / xét nghiệm")
def record_exam_result(
    req: ExamResultCreate,
    payload: dict = Depends(require_permission("clinical:record_result")),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.record_exam_result(req, actor_id=payload.get("sub"))


@router.get("/exam-results/progress/{progress_id}", response_model=Optional[ExamResultResponse], summary="Xem kết quả khám theo tiến độ dịch vụ")
def get_exam_result(
    progress_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.get_exam_result(progress_id)


# 2. Chẩn đoán bệnh (Bác sĩ)
@router.post("/diagnoses", response_model=DiagnosisResponse, summary="Bác sĩ ghi nhận chẩn đoán bệnh")
def record_diagnosis(
    req: DiagnosisCreate,
    payload: dict = Depends(require_permission("clinical:diagnose")),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.record_diagnosis(req, doctor_account_id=payload.get("sub"))


@router.get("/visits/{visit_id}/diagnoses", response_model=List[DiagnosisResponse], summary="Lấy danh sách chẩn đoán của lượt khám")
def get_diagnoses(
    visit_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.get_diagnoses_by_visit(visit_id)


# 3. Kê đơn thuốc (Bác sĩ)
@router.post("/prescriptions", response_model=PrescriptionResponse, summary="Bác sĩ kê đơn thuốc")
def create_prescription(
    req: PrescriptionCreate,
    payload: dict = Depends(require_permission("clinical:prescribe")),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.create_prescription(req, doctor_account_id=payload.get("sub"))


@router.get("/visits/{visit_id}/prescriptions", response_model=List[PrescriptionResponse], summary="Xem đơn thuốc của lượt khám")
def get_prescriptions(
    visit_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.get_prescriptions_by_visit(visit_id)


# 4. Kế hoạch điều trị (Bác sĩ)
@router.post("/treatment-plans", response_model=TreatmentPlanResponse, summary="Bác sĩ lập kế hoạch điều trị")
def create_treatment_plan(
    req: TreatmentPlanCreate,
    payload: dict = Depends(require_permission("clinical:diagnose")),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.create_treatment_plan(req, doctor_account_id=payload.get("sub"))


@router.get("/visits/{visit_id}/treatment-plans", response_model=List[TreatmentPlanResponse], summary="Xem kế hoạch điều trị")
def get_treatment_plans(
    visit_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.get_treatment_plans_by_visit(visit_id)


# 5. Kết luận lượt khám (Bác sĩ)
@router.post("/conclusions", response_model=ConclusionResponse, summary="Bác sĩ lập kết luận lượt khám")
def create_conclusion(
    req: ConclusionCreate,
    payload: dict = Depends(require_permission("clinical:conclude")),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.create_conclusion(req, doctor_account_id=payload.get("sub"))


@router.get("/visits/{visit_id}/conclusion", response_model=Optional[ConclusionResponse], summary="Xem kết luận của lượt khám")
def get_conclusion(
    visit_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.get_conclusion_by_visit(visit_id)


# 6. Tóm tắt toàn bộ hồ sơ lượt khám phục vụ In Phiếu Khám
@router.get("/visits/{visit_id}/summary", response_model=VisitSummaryResponse, summary="Lấy tóm tắt toàn bộ hồ sơ lượt khám để in phiếu khám")
def get_visit_summary(
    visit_id: str,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = ClinicalService(db)
    return service.get_visit_summary(visit_id)
