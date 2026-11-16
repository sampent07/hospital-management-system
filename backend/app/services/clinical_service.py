from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.clinical import (
    ExamResult,
    Diagnosis,
    TreatmentPlan,
    Prescription,
    PrescriptionItem,
    Conclusion,
)
from app.models.visit import Visit, VisitProgress
from app.models.account import Account, Doctor
from app.core.exceptions import ResourceNotFound, AppException
from app.core.database import get_utc_now
from app.schemas.clinical import (
    ExamResultCreate,
    DiagnosisCreate,
    PrescriptionCreate,
    TreatmentPlanCreate,
    ConclusionCreate,
    VisitSummaryResponse,
    VisitSummaryServiceItem,
    DiagnosisResponse,
    PrescriptionResponse,
    PrescriptionItemResponse,
    TreatmentPlanResponse,
    ConclusionResponse,
)


class ClinicalService:
    def __init__(self, db: Session):
        self.db = db

    def _get_or_ensure_doctor_id(self, account_id: str) -> str:
        """Đảm bảo ID bác sĩ tồn tại trong bảng doctors."""
        doc = self.db.query(Doctor).filter(Doctor.id == account_id).first()
        if doc:
            return doc.id
        # Nếu chưa có profile Doctor (ví dụ trong test hoặc admin thao tác), tự động tạo profile
        acc = self.db.query(Account).filter(Account.id == account_id).first()
        if acc:
            new_doc = Doctor(id=account_id, specialty="Đa khoa", license_number="CCHN-AUTO")
            self.db.add(new_doc)
            self.db.flush()
            return account_id
        return account_id

    # 1. Ghi nhận kết quả cận lâm sàng
    def record_exam_result(self, req: ExamResultCreate, actor_id: str) -> ExamResult:
        progress = self.db.query(VisitProgress).filter(VisitProgress.id == req.visit_progress_id).first()
        if not progress:
            raise ResourceNotFound("VisitProgress", req.visit_progress_id)

        # Kiểm tra xem đã có kết quả trước đó chưa
        existing = self.db.query(ExamResult).filter(ExamResult.visit_progress_id == req.visit_progress_id).first()
        if existing:
            existing.result_content = req.result_content
            existing.attachment_url = req.attachment_url
            existing.recorded_by_id = actor_id
            existing.recorded_at = get_utc_now()
            self.db.commit()
            self.db.refresh(existing)
            return existing

        exam_res = ExamResult(
            visit_progress_id=req.visit_progress_id,
            result_content=req.result_content,
            attachment_url=req.attachment_url,
            recorded_by_id=actor_id
        )
        self.db.add(exam_res)
        self.db.commit()
        self.db.refresh(exam_res)
        return exam_res

    def get_exam_result(self, progress_id: str) -> Optional[ExamResult]:
        return self.db.query(ExamResult).filter(ExamResult.visit_progress_id == progress_id).first()

    # 2. Chẩn đoán bệnh
    def record_diagnosis(self, req: DiagnosisCreate, doctor_account_id: str) -> Diagnosis:
        visit = self.db.query(Visit).filter(Visit.id == req.visit_id).first()
        if not visit:
            raise ResourceNotFound("Visit", req.visit_id)

        doc_id = self._get_or_ensure_doctor_id(doctor_account_id)
        diagnosis = Diagnosis(
            visit_id=visit.id,
            doctor_id=doc_id,
            icd10_code=req.icd10_code,
            diagnosis_description=req.diagnosis_description
        )
        self.db.add(diagnosis)
        self.db.commit()
        self.db.refresh(diagnosis)
        return diagnosis

    def get_diagnoses_by_visit(self, visit_id: str) -> List[Diagnosis]:
        return self.db.query(Diagnosis).filter(Diagnosis.visit_id == visit_id).order_by(Diagnosis.diagnosed_at.asc()).all()

    # 3. Kê đơn thuốc
    def create_prescription(self, req: PrescriptionCreate, doctor_account_id: str) -> Prescription:
        visit = self.db.query(Visit).filter(Visit.id == req.visit_id).first()
        if not visit:
            raise ResourceNotFound("Visit", req.visit_id)

        doc_id = self._get_or_ensure_doctor_id(doctor_account_id)
        presc = Prescription(
            visit_id=visit.id,
            doctor_id=doc_id,
            doctor_advice=req.doctor_advice
        )
        self.db.add(presc)
        self.db.flush()

        for it in req.items:
            p_item = PrescriptionItem(
                prescription_id=presc.id,
                drug_name=it.drug_name,
                dosage=it.dosage,
                unit=it.unit,
                quantity=it.quantity,
                usage_instructions=it.usage_instructions
            )
            self.db.add(p_item)

        self.db.commit()
        self.db.refresh(presc)
        return presc

    def get_prescriptions_by_visit(self, visit_id: str) -> List[Prescription]:
        return self.db.query(Prescription).filter(Prescription.visit_id == visit_id).order_by(Prescription.prescribed_at.desc()).all()

    # 4. Kế hoạch điều trị
    def create_treatment_plan(self, req: TreatmentPlanCreate, doctor_account_id: str) -> TreatmentPlan:
        visit = self.db.query(Visit).filter(Visit.id == req.visit_id).first()
        if not visit:
            raise ResourceNotFound("Visit", req.visit_id)

        doc_id = self._get_or_ensure_doctor_id(doctor_account_id)
        plan = TreatmentPlan(
            visit_id=visit.id,
            doctor_id=doc_id,
            plan_content=req.plan_content,
            estimated_duration_days=req.estimated_duration_days
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan

    def get_treatment_plans_by_visit(self, visit_id: str) -> List[TreatmentPlan]:
        return self.db.query(TreatmentPlan).filter(TreatmentPlan.visit_id == visit_id).order_by(TreatmentPlan.started_at.desc()).all()

    # 5. Kết luận lượt khám
    def create_conclusion(self, req: ConclusionCreate, doctor_account_id: str) -> Conclusion:
        visit = self.db.query(Visit).filter(Visit.id == req.visit_id).first()
        if not visit:
            raise ResourceNotFound("Visit", req.visit_id)

        doc_id = self._get_or_ensure_doctor_id(doctor_account_id)
        # Nếu đã có kết luận, cập nhật lại
        conclusion = self.db.query(Conclusion).filter(Conclusion.visit_id == req.visit_id).first()
        if conclusion:
            conclusion.conclusion_text = req.conclusion_text
            conclusion.doctor_recommendation = req.doctor_recommendation
            conclusion.doctor_id = doc_id
            conclusion.concluded_at = get_utc_now()
        else:
            conclusion = Conclusion(
                visit_id=visit.id,
                doctor_id=doc_id,
                conclusion_text=req.conclusion_text,
                doctor_recommendation=req.doctor_recommendation
            )
            self.db.add(conclusion)

        # Đánh dấu lượt khám là COMPLETED nếu bác sĩ đã kết luận
        if visit.status != "COMPLETED":
            visit.status = "COMPLETED"
            visit.completed_at = get_utc_now()

        self.db.commit()
        self.db.refresh(conclusion)
        return conclusion

    def get_conclusion_by_visit(self, visit_id: str) -> Optional[Conclusion]:
        return self.db.query(Conclusion).filter(Conclusion.visit_id == visit_id).first()

    # 6. Tóm tắt toàn bộ hồ sơ lượt khám phục vụ In Phiếu Khám
    def get_visit_summary(self, visit_id: str) -> VisitSummaryResponse:
        visit = self.db.query(Visit).filter(Visit.id == visit_id).first()
        if not visit:
            raise ResourceNotFound("Visit", visit_id)

        patient = visit.patient
        package_name = visit.package.name if visit.package else "Khám theo chỉ định"

        # Lấy danh sách dịch vụ và kết quả tương ứng
        services_summary = []
        for p in visit.progress_items:
            exam_res = self.get_exam_result(p.id)
            services_summary.append(
                VisitSummaryServiceItem(
                    progress_id=p.id,
                    service_code=p.exam_service.code,
                    service_name=p.exam_service.name,
                    category=p.exam_service.category,
                    status=p.status,
                    result_content=exam_res.result_content if exam_res else None,
                    attachment_url=exam_res.attachment_url if exam_res else None
                )
            )

        diagnoses = self.get_diagnoses_by_visit(visit.id)
        prescriptions = self.get_prescriptions_by_visit(visit.id)
        plans = self.get_treatment_plans_by_visit(visit.id)
        conclusion = self.get_conclusion_by_visit(visit.id)

        # Lấy tên bác sĩ kết luận hoặc bác sĩ phụ trách
        doctor_name = None
        if conclusion:
            doc_account = self.db.query(Account).filter(Account.id == conclusion.doctor_id).first()
            if doc_account:
                doctor_name = doc_account.full_name

        return VisitSummaryResponse(
            visit_id=visit.id,
            visit_code=visit.visit_code,
            check_in_at=visit.check_in_at,
            completed_at=visit.completed_at,
            patient_name=patient.full_name if patient else "N/A",
            patient_dob=patient.date_of_birth if patient else get_utc_now().date(),
            patient_gender=patient.gender if patient else "OTHER",
            patient_phone=patient.phone_number if patient else "N/A",
            patient_address=patient.address if patient else None,
            package_name=package_name,
            doctor_name=doctor_name,
            services=services_summary,
            diagnoses=[DiagnosisResponse.model_validate(d) for d in diagnoses],
            prescriptions=[PrescriptionResponse.model_validate(p) for p in prescriptions],
            treatment_plans=[TreatmentPlanResponse.model_validate(tp) for tp in plans],
            conclusion=ConclusionResponse.model_validate(conclusion) if conclusion else None
        )
