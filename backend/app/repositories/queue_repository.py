from typing import Dict, List, Any
from sqlalchemy import func, case
from sqlalchemy.orm import Session
from app.models.service import ServicePoint
from app.models.visit import VisitProgress, Visit
from app.models.customer import Patient


class QueueRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_service_point_queue_metrics(self) -> Dict[str, Dict[str, int]]:
        """Lấy số lượng người chờ và đang thực hiện của MỌI điểm dịch vụ TRONG MỘT TRUY VẤN TỔNG HỢP DUY NHẤT.
        
        Tuân thủ nghiêm ngặt DOMAIN_RULES.md Mục 4: GROUP BY với COUNT(*) FILTER (...) - không N+1 loop.
        """
        metrics = self.db.query(
            VisitProgress.service_point_id,
            func.count(case((VisitProgress.status == "WAITING", 1))).label("waiting_count"),
            func.count(case((VisitProgress.status == "IN_PROGRESS", 1))).label("in_progress_count")
        ).group_by(VisitProgress.service_point_id).all()

        result = {}
        for row in metrics:
            result[row.service_point_id] = {
                "waiting_count": int(row.waiting_count),
                "in_progress_count": int(row.in_progress_count)
            }
        return result

    def get_queue_patients_for_service_point(self, service_point_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Lấy danh sách chi tiết bệnh nhân: Đang thực hiện, Đang chờ (theo ưu tiên + giờ vào hàng), Vừa hoàn thành."""
        records = (
            self.db.query(VisitProgress, Visit, Patient)
            .join(Visit, VisitProgress.visit_id == Visit.id)
            .join(Patient, Visit.patient_id == Patient.id)
            .filter(VisitProgress.service_point_id == service_point_id)
            .filter(VisitProgress.status.in_(["WAITING", "IN_PROGRESS", "COMPLETED"]))
            .order_by(Visit.is_priority.desc(), VisitProgress.queued_at.asc(), VisitProgress.completed_at.desc())
            .all()
        )

        in_progress = []
        waiting = []
        completed = []

        for vp, visit, pat in records:
            item = {
                "progress_id": vp.id,
                "visit_id": visit.id,
                "visit_code": visit.visit_code,
                "patient_name": pat.full_name,
                "is_priority": visit.is_priority,
                "queue_number": visit.queue_number,
                "queued_at": vp.queued_at or vp.assigned_at,
                "status": vp.status,
                "version": vp.version
            }
            if vp.status == "IN_PROGRESS":
                in_progress.append(item)
            elif vp.status == "WAITING":
                waiting.append(item)
            elif vp.status == "COMPLETED" and len(completed) < 10:
                completed.append(item)

        return {
            "in_progress": in_progress,
            "waiting": waiting,
            "completed": completed
        }
