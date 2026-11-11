from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.visit import Visit, VisitProgress
from app.models.service import ExamService, ServicePoint
from app.repositories.base import BaseRepository


class VisitRepository(BaseRepository[Visit]):
    def __init__(self, db: Session):
        super().__init__(Visit, db)

    def get_by_code(self, code: str) -> Optional[Visit]:
        return self.db.query(Visit).filter(Visit.visit_code == code).first()

    def get_visit_with_details(self, visit_id: str) -> Optional[Visit]:
        return (
            self.db.query(Visit)
            .options(
                joinedload(Visit.patient),
                joinedload(Visit.package),
                joinedload(Visit.progress_items).joinedload(VisitProgress.exam_service),
                joinedload(Visit.progress_items).joinedload(VisitProgress.service_point)
            )
            .filter(Visit.id == visit_id)
            .first()
        )

    def get_next_queue_number_for_today(self) -> int:
        """Đếm số lượt khám trong ngày để tạo số thứ tự."""
        count = self.db.query(Visit).count()
        return count + 1


class ProgressRepository(BaseRepository[VisitProgress]):
    def __init__(self, db: Session):
        super().__init__(VisitProgress, db)

    def get_by_visit_and_service(self, visit_id: str, service_id: str) -> Optional[VisitProgress]:
        return (
            self.db.query(VisitProgress)
            .filter(VisitProgress.visit_id == visit_id, VisitProgress.exam_service_id == service_id)
            .first()
        )

    def get_progress_items_by_visit(self, visit_id: str) -> List[VisitProgress]:
        return (
            self.db.query(VisitProgress)
            .options(
                joinedload(VisitProgress.exam_service),
                joinedload(VisitProgress.service_point)
            )
            .filter(VisitProgress.visit_id == visit_id)
            .all()
        )
