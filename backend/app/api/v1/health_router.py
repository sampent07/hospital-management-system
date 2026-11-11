from fastapi import APIRouter
from app.core.database import get_utc_now

router = APIRouter(tags=["Hệ thống & Sức khỏe"])


@router.get("/health", summary="Kiểm tra trạng thái hoạt động API")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Smart OPD Backend API",
        "current_time_utc": get_utc_now().isoformat()
    }
