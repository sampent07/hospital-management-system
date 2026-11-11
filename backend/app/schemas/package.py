from typing import List, Optional
from pydantic import BaseModel, Field


class ExamServiceItemResponse(BaseModel):
    id: str
    code: str
    name: str
    category: str
    has_result_waiting: bool
    default_service_point_id: str
    service_point_name: Optional[str] = None

    class Config:
        from_attributes = True


class PackageResponse(BaseModel):
    id: str
    code: str
    name: str
    package_type: str
    target_group: Optional[str] = None
    description: Optional[str] = None
    base_price: float
    tier_name: Optional[str] = None
    services: List[ExamServiceItemResponse] = []

    class Config:
        from_attributes = True


class PackageAdvisorRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., description="MALE, FEMALE, OTHER")
    marital_status: Optional[str] = "SINGLE"
    symptoms: List[str] = []
    examination_purpose: Optional[str] = "GENERAL_CHECKUP"  # GENERAL_CHECKUP, PRE_EMPLOYMENT, SCREENING


class PackageAdvisorResponse(BaseModel):
    recommended_package: Optional[PackageResponse] = None
    alternative_packages: List[PackageResponse] = []
    explanation: str
    warning_disclaimer: str = (
        "LƯU Ý QUAN TRỌNG: Kết quả gợi ý chỉ mang tính chất tham khảo dựa trên quy tắc thống kê, "
        "không thay thế cho chẩn đoán y khoa của Bác sĩ. Nếu quý khách có các triệu chứng khẩn cấp, "
        "vui lòng đến ngay khu vực Cấp cứu hoặc gặp Bác sĩ tư vấn tại quầy tiếp nhận."
    )
