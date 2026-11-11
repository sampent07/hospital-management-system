from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.queue_service import QueueService
from app.schemas.queue import ServicePointQueueSummary

router = APIRouter(prefix="/queues", tags=["Hàng đợi & Điều phối"])


@router.get("", response_model=List[ServicePointQueueSummary], summary="Xem tình trạng hàng đợi toàn bộ điểm dịch vụ")
def get_all_queues(db: Session = Depends(get_db)):
    """Trả về tình trạng hàng đợi, số người chờ và thời gian chờ ước tính toàn viện.
    
    Tính toán bằng 1 truy vấn GROUP BY duy nhất, không N+1.
    """
    service = QueueService(db)
    return service.get_all_queue_summaries()


@router.get("/service-points/{service_point_id}", response_model=ServicePointQueueSummary, summary="Xem chi tiết hàng đợi tại 1 điểm")
def get_service_point_queue(service_point_id: str, db: Session = Depends(get_db)):
    """Xem danh sách bệnh nhân Đang thực hiện, Đang chờ và Vừa hoàn thành tại 1 điểm."""
    service = QueueService(db)
    return service.get_single_queue_summary(service_point_id)
