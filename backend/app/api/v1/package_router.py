from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.package_service import PackageService
from app.schemas.package import (
    PackageResponse,
    PackageAdvisorRequest,
    PackageAdvisorResponse,
)
from app.schemas.patient import PackageAvailableSchedulesResponse

router = APIRouter(prefix="/packages", tags=["Gói khám & Tư vấn"])


@router.get("", response_model=List[PackageResponse], summary="Danh sách các gói khám đang hoạt động")
@router.get("/", response_model=List[PackageResponse], include_in_schema=False)
def list_packages(db: Session = Depends(get_db)):
    service = PackageService(db)
    return service.get_active_packages()


@router.get("/{package_id}/available-schedules", response_model=PackageAvailableSchedulesResponse, summary="Lịch khám khả dụng của bác sĩ theo gói khám")
def get_available_schedules(
    package_id: str,
    month: Optional[str] = Query(None, description="Tháng cần xem theo định dạng YYYY-MM, e.g. 2026-11"),
    db: Session = Depends(get_db)
):
    """Trả về bảng lịch các ngày trong tháng (Xanh: Còn chỗ, Vàng: Hết chỗ, Xám: Không khả dụng) kèm chi tiết bác sĩ và khung giờ."""
    service = PackageService(db)
    return service.get_available_schedules_for_package(package_id, month)


@router.post("/advisor", response_model=PackageAdvisorResponse, summary="Gợi ý gói khám theo triệu chứng và đối tượng")
def advise_package(req: PackageAdvisorRequest, db: Session = Depends(get_db)):
    """Gợi ý gói khám kèm cảnh báo bắt buộc theo DOMAIN_RULES.md Mục 8."""
    service = PackageService(db)
    return service.advise_package(req)
