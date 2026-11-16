from fastapi import APIRouter
from app.core.config import settings
from app.schemas.common import PublicConfigurationResponse

router = APIRouter(prefix="/config", tags=["Cấu hình công khai"])


@router.get("/public", response_model=PublicConfigurationResponse, summary="Cấu hình hiển thị công khai của cơ sở")
def get_public_configuration():
    """Trả cấu hình cần thiết cho hiển thị lịch giờ địa phương."""
    return {"facility_timezone": settings.FACILITY_TIMEZONE}
