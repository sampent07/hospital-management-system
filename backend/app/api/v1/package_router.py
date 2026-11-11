from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.package_service import PackageService
from app.schemas.package import (
    PackageResponse,
    PackageAdvisorRequest,
    PackageAdvisorResponse,
)

router = APIRouter(prefix="/packages", tags=["Gói khám & Tư vấn"])


@router.get("", response_model=List[PackageResponse], summary="Danh sách các gói khám đang hoạt động")
def list_packages(db: Session = Depends(get_db)):
    service = PackageService(db)
    return service.get_active_packages()


@router.post("/advisor", response_model=PackageAdvisorResponse, summary="Gợi ý gói khám theo triệu chứng và đối tượng")
def advise_package(req: PackageAdvisorRequest, db: Session = Depends(get_db)):
    """Gợi ý gói khám kèm cảnh báo bắt buộc theo DOMAIN_RULES.md Mục 8."""
    service = PackageService(db)
    return service.advise_package(req)
