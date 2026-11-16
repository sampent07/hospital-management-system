from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, Field


# 1. Kết quả cận lâm sàng
class ExamResultCreate(BaseModel):
    visit_progress_id: str = Field(..., description="ID tiến độ dịch vụ tương ứng")
    result_content: str = Field(..., description="Nội dung kết luận kết quả xét nghiệm / chẩn đoán hình ảnh")
    attachment_url: Optional[str] = None


class ExamResultResponse(BaseModel):
    id: str
    visit_progress_id: str
    result_content: str
    attachment_url: Optional[str] = None
    recorded_by_id: str
    recorded_at: datetime

    class Config:
        from_attributes = True


# 2. Chẩn đoán bệnh của Bác sĩ
class DiagnosisCreate(BaseModel):
    visit_id: str = Field(..., description="ID lượt khám")
    icd10_code: Optional[str] = Field(None, description="Mã phân loại bệnh quốc tế ICD-10")
    diagnosis_description: str = Field(..., description="Mô tả chẩn đoán xác định hoặc sơ bộ")


class DiagnosisResponse(BaseModel):
    id: str
    visit_id: str
    doctor_id: str
    icd10_code: Optional[str] = None
    diagnosis_description: str
    diagnosed_at: datetime

    class Config:
        from_attributes = True


# 3. Kê đơn thuốc
class PrescriptionItemCreate(BaseModel):
    drug_name: str = Field(..., description="Tên thuốc")
    dosage: str = Field(..., description="Hàm lượng / liều dùng (e.g. 500mg)")
    unit: str = Field(..., description="Đơn vị tính (viên, chai, tuýp)")
    quantity: int = Field(..., ge=1, description="Số lượng")
    usage_instructions: str = Field(..., description="Cách dùng (uống sáng 1 viên sau ăn...)")


class PrescriptionItemResponse(BaseModel):
    id: str
    prescription_id: str
    drug_name: str
    dosage: str
    unit: str
    quantity: int
    usage_instructions: str

    class Config:
        from_attributes = True


class PrescriptionCreate(BaseModel):
    visit_id: str = Field(..., description="ID lượt khám")
    doctor_advice: Optional[str] = Field(None, description="Lời dặn của bác sĩ")
    items: List[PrescriptionItemCreate] = Field(..., min_items=1, description="Danh sách thuốc")


class PrescriptionResponse(BaseModel):
    id: str
    visit_id: str
    doctor_id: str
    prescribed_at: datetime
    doctor_advice: Optional[str] = None
    items: List[PrescriptionItemResponse] = []

    class Config:
        from_attributes = True


# 4. Kế hoạch điều trị
class TreatmentPlanCreate(BaseModel):
    visit_id: str = Field(..., description="ID lượt khám")
    plan_content: str = Field(..., description="Nội dung kế hoạch / phác đồ điều trị")
    estimated_duration_days: Optional[int] = Field(None, description="Số ngày dự kiến điều trị")


class TreatmentPlanResponse(BaseModel):
    id: str
    visit_id: str
    doctor_id: str
    plan_content: str
    started_at: datetime
    estimated_duration_days: Optional[int] = None
    status: str

    class Config:
        from_attributes = True


# 5. Kết luận lượt khám
class ConclusionCreate(BaseModel):
    visit_id: str = Field(..., description="ID lượt khám")
    conclusion_text: str = Field(..., description="Kết luận bệnh và tình trạng sức khỏe chung")
    doctor_recommendation: Optional[str] = Field(None, description="Khuyến nghị theo dõi / chế độ sinh hoạt")


class ConclusionResponse(BaseModel):
    id: str
    visit_id: str
    doctor_id: str
    conclusion_text: str
    doctor_recommendation: Optional[str] = None
    concluded_at: datetime

    class Config:
        from_attributes = True


# 6. Tóm tắt lượt khám phục vụ In Phiếu Khám
class VisitSummaryServiceItem(BaseModel):
    progress_id: str
    service_code: str
    service_name: str
    category: str
    status: str
    result_content: Optional[str] = None
    attachment_url: Optional[str] = None


class VisitSummaryResponse(BaseModel):
    visit_id: str
    visit_code: str
    check_in_at: datetime
    completed_at: Optional[datetime] = None
    patient_name: str
    patient_dob: date
    patient_gender: str
    patient_phone: str
    patient_address: Optional[str] = None
    package_name: Optional[str] = None
    doctor_name: Optional[str] = None
    services: List[VisitSummaryServiceItem] = []
    diagnoses: List[DiagnosisResponse] = []
    prescriptions: List[PrescriptionResponse] = []
    treatment_plans: List[TreatmentPlanResponse] = []
    conclusion: Optional[ConclusionResponse] = None
