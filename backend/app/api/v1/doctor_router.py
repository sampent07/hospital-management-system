from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.doctor_service import DoctorService
from app.schemas.doctor import DoctorListItem, DoctorDetail

router = APIRouter(prefix="/doctors", tags=["Danh mục Bác sĩ & Lịch khám"])


@router.get("", response_model=List[DoctorListItem], summary="Danh sách bác sĩ và lịch khám")
@router.get("/", response_model=List[DoctorListItem], include_in_schema=False)
def list_doctors(
    specialty: Optional[str] = Query(None, description="Lọc theo chuyên khoa"),
    day_of_week: Optional[str] = Query(None, description="Lọc theo thứ: 2 (Thứ 2) đến 7 (Thứ 7)"),
    q: Optional[str] = Query(None, description="Tìm kiếm theo tên bác sĩ hoặc chuyên khoa"),
    db: Session = Depends(get_db)
):
    """Lấy danh sách các bác sĩ, chuyên môn, lịch trực và hình ảnh đại diện."""
    service = DoctorService(db)
    return service.list_doctors(specialty=specialty, day_of_week=day_of_week, q=q)


@router.get("/specialties", response_model=List[str], summary="Danh sách chuyên khoa hiện có")
def list_specialties(db: Session = Depends(get_db)):
    """Trả về danh sách các chuyên khoa để hiển thị lên dropdown lọc."""
    service = DoctorService(db)
    return service.list_specialties()


@router.get("/{doctor_id}", response_model=DoctorDetail, summary="Chi tiết hồ sơ và lịch làm việc của bác sĩ")
def get_doctor_detail(doctor_id: str, db: Session = Depends(get_db)):
    """Trả về chi tiết 4 tab: Lịch khám, Đào tạo, Công tác, Hiệp hội chuyên môn."""
    service = DoctorService(db)
    return service.get_doctor_detail(doctor_id)
