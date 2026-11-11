from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.service import ServicePoint
from app.repositories.queue_repository import QueueRepository
from app.schemas.queue import ServicePointQueueSummary, QueuePatientItem


class QueueService:
    def __init__(self, db: Session):
        self.db = db
        self.queue_repo = QueueRepository(db)

    @staticmethod
    def calculate_estimated_wait_seconds(waiting_count: int, avg_duration_seconds: int, resource_count: int) -> int:
        """CÔNG THỨC DUY NHẤT ước lượng thời gian chờ (dùng chung cho cả Backend, Frontend và AI).
        
        DOMAIN_RULES.md Mục 4.
        """
        resources = max(1, resource_count)
        return int((waiting_count * avg_duration_seconds) / resources)

    def get_all_queue_summaries(self) -> List[ServicePointQueueSummary]:
        """Lấy bảng tổng hợp hàng đợi của toàn bộ các điểm dịch vụ trong bệnh viện."""
        service_points = self.db.query(ServicePoint).filter(ServicePoint.status == "ACTIVE").all()
        metrics_by_sp = self.queue_repo.get_all_service_point_queue_metrics()

        summaries = []
        for sp in service_points:
            metric = metrics_by_sp.get(sp.id, {"waiting_count": 0, "in_progress_count": 0})
            w_count = metric["waiting_count"]
            ip_count = metric["in_progress_count"]
            wait_seconds = self.calculate_estimated_wait_seconds(
                w_count,
                sp.avg_service_duration_seconds,
                sp.resource_count
            )
            is_full = w_count >= sp.queue_capacity

            # Lấy danh sách bệnh nhân
            patient_buckets = self.queue_repo.get_queue_patients_for_service_point(sp.id)

            summaries.append(
                ServicePointQueueSummary(
                    service_point_id=sp.id,
                    service_point_code=sp.code,
                    service_point_name=sp.name,
                    room_number=sp.room_number,
                    resource_count=sp.resource_count,
                    avg_service_duration_seconds=sp.avg_service_duration_seconds,
                    queue_capacity=sp.queue_capacity,
                    waiting_count=w_count,
                    in_progress_count=ip_count,
                    estimated_wait_seconds=wait_seconds,
                    is_full=is_full,
                    waiting_patients=[QueuePatientItem(**p) for p in patient_buckets["waiting"]],
                    in_progress_patients=[QueuePatientItem(**p) for p in patient_buckets["in_progress"]],
                    recently_completed_patients=[QueuePatientItem(**p) for p in patient_buckets["completed"]]
                )
            )
        return summaries

    def get_single_queue_summary(self, service_point_id: str) -> ServicePointQueueSummary:
        sp = self.db.query(ServicePoint).filter(ServicePoint.id == service_point_id).first()
        if not sp:
            from app.core.exceptions import ResourceNotFound
            raise ResourceNotFound("ServicePoint", service_point_id)

        metrics = self.queue_repo.get_all_service_point_queue_metrics()
        metric = metrics.get(sp.id, {"waiting_count": 0, "in_progress_count": 0})
        w_count = metric["waiting_count"]
        wait_seconds = self.calculate_estimated_wait_seconds(
            w_count, sp.avg_service_duration_seconds, sp.resource_count
        )

        patient_buckets = self.queue_repo.get_queue_patients_for_service_point(sp.id)
        return ServicePointQueueSummary(
            service_point_id=sp.id,
            service_point_code=sp.code,
            service_point_name=sp.name,
            room_number=sp.room_number,
            resource_count=sp.resource_count,
            avg_service_duration_seconds=sp.avg_service_duration_seconds,
            queue_capacity=sp.queue_capacity,
            waiting_count=w_count,
            in_progress_count=metric["in_progress_count"],
            estimated_wait_seconds=wait_seconds,
            is_full=w_count >= sp.queue_capacity,
            waiting_patients=[QueuePatientItem(**p) for p in patient_buckets["waiting"]],
            in_progress_patients=[QueuePatientItem(**p) for p in patient_buckets["in_progress"]],
            recently_completed_patients=[QueuePatientItem(**p) for p in patient_buckets["completed"]]
        )
