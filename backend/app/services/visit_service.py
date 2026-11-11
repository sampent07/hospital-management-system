from datetime import timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.visit import Visit, VisitProgress
from app.models.package import Package, PackageServiceItem
from app.models.service import ServicePoint, ExamService
from app.models.customer import Patient
from app.models.account import Account, SystemLog
from app.repositories.visit_repository import VisitRepository, ProgressRepository
from app.core.exceptions import (
    InvalidStatusTransition,
    ConcurrentUpdateError,
    UndoWindowExpired,
    ResourceNotFound,
    QueueFull,
)
from app.core.database import get_utc_now
from app.core.config import settings
from app.core.websocket import ws_manager
from app.schemas.visit import VisitCreateRequest, StatusTransitionRequest


VALID_TRANSITIONS = {
    "NOT_STARTED": ["WAITING"],
    "WAITING": ["IN_PROGRESS", "NOT_STARTED"],  # Hỗ trợ trả lại
    "IN_PROGRESS": ["COMPLETED", "WAITING"],
    "COMPLETED": []  # Không chuyển tiếp sau khi đã hoàn thành
}


class VisitService:
    def __init__(self, db: Session):
        self.db = db
        self.visit_repo = VisitRepository(db)
        self.progress_repo = ProgressRepository(db)

    def create_visit(self, req: VisitCreateRequest, creator_id: Optional[str] = None) -> Visit:
        """Tiếp nhận bệnh nhân, tạo lượt khám và sinh các dịch vụ khởi tạo."""
        patient = self.db.query(Patient).filter(Patient.id == req.patient_id).first()
        if not patient:
            raise ResourceNotFound("Patient", req.patient_id)

        queue_number = self.visit_repo.get_next_queue_number_for_today()
        now = get_utc_now()
        visit_code = f"VK-{now.strftime('%Y%m%d')}-{queue_number:03d}"

        new_visit = Visit(
            visit_code=visit_code,
            patient_id=req.patient_id,
            package_id=req.package_id,
            visit_type=req.visit_type,
            reception_channel=req.reception_channel,
            is_priority=req.is_priority,
            queue_number=queue_number,
            status="REGISTERED",
            check_in_at=now,
            created_by_id=creator_id
        )
        self.db.add(new_visit)
        self.db.flush()

        # Nếu khám theo gói, tự động thêm các dịch vụ của gói
        if req.package_id:
            pkg_items = self.db.query(PackageServiceItem).filter(PackageServiceItem.package_id == req.package_id).all()
            for item in pkg_items:
                exam_serv = self.db.query(ExamService).filter(ExamService.id == item.exam_service_id).first()
                if exam_serv:
                    progress = VisitProgress(
                        visit_id=new_visit.id,
                        exam_service_id=exam_serv.id,
                        service_point_id=exam_serv.default_service_point_id,
                        service_source="PACKAGE",
                        status="NOT_STARTED",
                        assigned_at=now,
                        version=1
                    )
                    self.db.add(progress)

        self.db.commit()
        return self.visit_repo.get_visit_with_details(new_visit.id)

    async def update_progress_status(
        self,
        progress_id: str,
        req: StatusTransitionRequest,
        actor_id: Optional[str] = None
    ) -> VisitProgress:
        """Cập nhật trạng thái dịch vụ (Vòng đời: NOT_STARTED -> WAITING -> IN_PROGRESS -> COMPLETED).
        
        Kiểm tra khóa lạc quan (Optimistic Locking) và phát sự kiện realtime.
        """
        progress = self.progress_repo.get_by_id(progress_id)
        if not progress:
            raise ResourceNotFound("VisitProgress", progress_id)

        # 1. Kiểm tra khóa lạc quan (Optimistic Lock)
        if progress.version != req.expected_version:
            raise ConcurrentUpdateError(
                f"Dữ liệu đã thay đổi (Phiên bản hiện tại: {progress.version}, Bạn gửi: {req.expected_version})."
            )

        # 2. Kiểm tra tính hợp lệ của bước chuyển trạng thái
        allowed_next = VALID_TRANSITIONS.get(progress.status, [])
        if req.new_status not in allowed_next:
            raise InvalidStatusTransition(
                f"Không thể chuyển trạng thái từ '{progress.status}' sang '{req.new_status}'."
            )

        now = get_utc_now()
        previous_status = progress.status

        # 3. Áp dụng chuyển trạng thái
        if req.new_status == "WAITING":
            # Kiểm tra sức chứa hàng đợi
            sp = self.db.query(ServicePoint).filter(ServicePoint.id == progress.service_point_id).first()
            if sp:
                waiting_count = (
                    self.db.query(VisitProgress)
                    .filter(VisitProgress.service_point_id == sp.id, VisitProgress.status == "WAITING")
                    .count()
                )
                if waiting_count >= sp.queue_capacity:
                    raise QueueFull(f"Hàng đợi tại điểm '{sp.name}' đã đầy ({sp.queue_capacity} người).")
            progress.queued_at = now

        elif req.new_status == "IN_PROGRESS":
            progress.started_at = now

        elif req.new_status == "COMPLETED":
            progress.completed_at = now

        progress.status = req.new_status
        progress.performed_by_id = actor_id or req.performed_by_id
        progress.is_proxy_action = req.is_proxy_action
        progress.version += 1  # Tăng phiên bản

        # Ghi nhật ký hệ thống bất biến
        log_entry = SystemLog(
            actor_id=actor_id or req.performed_by_id,
            action_type="UPDATE_STATUS",
            target_type="VISIT_PROGRESS",
            target_id=progress.id,
            details={
                "from_status": previous_status,
                "to_status": req.new_status,
                "version": progress.version
            }
        )
        self.db.add(log_entry)
        self.db.commit()

        # Phát sự kiện Realtime qua WebSocket sau khi commit thành công
        await ws_manager.broadcast_event(
            "visit_progress.status_changed",
            {
                "progress_id": progress.id,
                "visit_id": progress.visit_id,
                "service_point_id": progress.service_point_id,
                "status": progress.status,
                "version": progress.version
            }
        )
        await ws_manager.broadcast_event(
            "queue.updated",
            {"service_point_id": progress.service_point_id}
        )

        return progress

    async def undo_status_transition(self, progress_id: str, actor_id: Optional[str] = None) -> VisitProgress:
        """Hoàn tác trạng thái trong cửa sổ STATUS_UNDO_WINDOW_SECONDS (60 giây)."""
        progress = self.progress_repo.get_by_id(progress_id)
        if not progress:
            raise ResourceNotFound("VisitProgress", progress_id)

        now = get_utc_now()
        # Kiểm tra mốc thời gian hoàn tác
        last_change_time = progress.completed_at or progress.started_at or progress.queued_at
        if not last_change_time or (now - last_change_time).total_seconds() > settings.STATUS_UNDO_WINDOW_SECONDS:
            raise UndoWindowExpired()

        # Lùi lại một bước
        if progress.status == "COMPLETED":
            progress.status = "IN_PROGRESS"
            progress.completed_at = None
        elif progress.status == "IN_PROGRESS":
            progress.status = "WAITING"
            progress.started_at = None
        elif progress.status == "WAITING":
            progress.status = "NOT_STARTED"
            progress.queued_at = None

        progress.version += 1
        self.db.commit()

        await ws_manager.broadcast_event("visit_progress.status_changed", {"progress_id": progress.id, "status": progress.status})
        await ws_manager.broadcast_event("queue.updated", {"service_point_id": progress.service_point_id})
        return progress
