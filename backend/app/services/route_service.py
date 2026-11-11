from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.visit import Visit, VisitProgress
from app.models.route import Route, RouteStep, RouteDecision
from app.models.service import ServicePoint, ExamService
from app.models.account import SystemLog
from app.repositories.route_repository import RouteRepository
from app.repositories.visit_repository import ProgressRepository
from app.services.queue_service import QueueService
from app.integrations.ai_client import ai_client
from app.core.exceptions import ResourceNotFound, AppException
from app.core.config import settings
from app.core.database import get_utc_now
from app.core.websocket import ws_manager
from app.schemas.route import RouteResponse, RouteStepResponse, RouteDecisionRequest


class RouteService:
    def __init__(self, db: Session):
        self.db = db
        self.route_repo = RouteRepository(db)
        self.progress_repo = ProgressRepository(db)
        self.queue_service = QueueService(db)

    async def calculate_or_recalculate_route(
        self,
        visit_id: str,
        is_initial: bool = False,
        actor_id: Optional[str] = None,
        is_proxy: bool = False
    ) -> RouteResponse:
        """Tính toán lộ trình tối ưu cho lượt khám (Initial hoặc Recalculate).
        
        Quy tắc:
        - Chỉ đề xuất lộ trình mới khi tiết kiệm >= ROUTE_MIN_IMPROVEMENT_MINUTES (3 phút).
        - Nếu không tốt hơn, trả thông báo 'Lộ trình hiện tại đã tối ưu'.
        - Tự động dùng fallback khi AI quá hạn / lỗi.
        """
        visit = self.db.query(Visit).filter(Visit.id == visit_id).first()
        if not visit:
            raise ResourceNotFound("Visit", visit_id)

        # Lấy các dịch vụ chưa hoàn thành
        uncompleted_items = (
            self.db.query(VisitProgress)
            .filter(VisitProgress.visit_id == visit_id, VisitProgress.status.in_(["NOT_STARTED", "WAITING"]))
            .all()
        )
        if not uncompleted_items:
            raise AppException(code="ALL_SERVICES_COMPLETED", message="Tất cả các dịch vụ của lượt khám đã hoàn thành.")

        # Lấy chỉ số hàng đợi hiện tại
        queue_summaries = self.queue_service.get_all_queue_summaries()
        queue_metrics = {
            qs.service_point_id: {
                "waiting_count": qs.waiting_count,
                "in_progress_count": qs.in_progress_count,
                "estimated_wait_seconds": qs.estimated_wait_seconds,
                "avg_service_duration_seconds": qs.avg_service_duration_seconds
            }
            for qs in queue_summaries
        }

        # Chuẩn bị danh sách hoạt động hợp lệ gửi tới AI
        valid_activities = [
            {
                "progress_id": vp.id,
                "service_id": vp.exam_service_id,
                "service_point_id": vp.service_point_id,
            }
            for vp in uncompleted_items
        ]

        # Gọi AI Service (hoặc tự động dùng heuristic fallback nếu lỗi/timeout)
        ai_result = await ai_client.infer_next_step_or_route(
            patient_state={"visit_id": visit_id, "is_priority": visit.is_priority},
            valid_activities=valid_activities,
            queue_metrics=queue_metrics
        )

        active_route = self.route_repo.get_active_route_for_visit(visit_id)
        current_est_seconds = active_route.estimated_total_duration_seconds if active_route else 999999
        new_est_seconds = ai_result.get("estimated_total_duration_seconds", 0)

        # Kiểm tra ngưỡng cải thiện ROUTE_MIN_IMPROVEMENT_MINUTES (3 phút = 180s)
        savings_seconds = current_est_seconds - new_est_seconds
        min_improvement_seconds = settings.ROUTE_MIN_IMPROVEMENT_MINUTES * 60

        if not is_initial and savings_seconds < min_improvement_seconds:
            # Không có lộ trình tốt hơn!
            return self._build_route_response(
                active_route,
                is_better=False,
                message=f"Lộ trình hiện tại đã tối ưu (Phương án mới chỉ tiết kiệm {max(0, savings_seconds // 60)} phút, dưới ngưỡng tối thiểu {settings.ROUTE_MIN_IMPROVEMENT_MINUTES} phút)."
            )

        # Tạo bản ghi Route mới
        new_version = (active_route.version + 1) if active_route else 1
        new_route = Route(
            visit_id=visit_id,
            version=new_version,
            creation_reason="INITIAL" if is_initial else "RECALC_REQUEST",
            status="ACTIVE" if is_initial else "ACTIVE",  # Đề xuất mới
            suggestion_source=ai_result.get("suggestion_source", "HEURISTIC_FALLBACK"),
            confidence=ai_result.get("confidence", 0.8),
            latency_ms=ai_result.get("latency_ms", 10),
            estimated_total_duration_seconds=new_est_seconds
        )
        self.db.add(new_route)
        self.db.flush()

        # Tạo RouteSteps
        step_responses = []
        for step_data in ai_result.get("steps", []):
            service_id = step_data["service_id"]
            vp = next((item for item in uncompleted_items if item.exam_service_id == service_id), None)
            if not vp:
                continue

            r_step = RouteStep(
                route_id=new_route.id,
                visit_progress_id=vp.id,
                step_order=step_data["step_order"],
                estimated_wait_seconds=step_data["estimated_wait_seconds"],
                estimated_service_seconds=step_data["estimated_service_seconds"]
            )
            self.db.add(r_step)

        self.db.commit()

        # Phát sự kiện Realtime
        await ws_manager.broadcast_event(
            "route.proposed" if not is_initial else "route.applied",
            {"visit_id": visit_id, "route_id": new_route.id, "version": new_route.version}
        )

        return self.get_route_by_id(new_route.id)

    def record_decision(self, route_id: str, req: RouteDecisionRequest, actor_id: str) -> None:
        """Ghi nhận quyết định bất biến của bệnh nhân (hoặc nhân viên thao tác hộ)."""
        route = self.route_repo.get_by_id(route_id)
        if not route:
            raise ResourceNotFound("Route", route_id)

        decision = RouteDecision(
            route_id=route_id,
            visit_id=route.visit_id,
            decision_type=req.decision_type,
            decided_by_id=actor_id,
            is_proxy_action=req.is_proxy_action,
            decided_at=get_utc_now()
        )
        self.db.add(decision)

        if req.decision_type == "ACCEPTED_NEW":
            # Đánh dấu các lộ trình cũ là REPLACED
            self.db.query(Route).filter(Route.visit_id == route.visit_id, Route.id != route_id).update({"status": "REPLACED"})
            route.status = "ACTIVE"
        elif req.decision_type == "KEPT_EXISTING":
            route.status = "REJECTED"

        self.db.commit()

    def get_route_by_id(self, route_id: str) -> RouteResponse:
        route = self.route_repo.get_by_id(route_id)
        if not route:
            raise ResourceNotFound("Route", route_id)
        return self._build_route_response(route)

    def _build_route_response(self, route: Route, is_better: bool = True, message: Optional[str] = None) -> RouteResponse:
        steps_out = []
        for st in route.steps:
            vp = self.db.query(VisitProgress).filter(VisitProgress.id == st.visit_progress_id).first()
            exam_serv = vp.exam_service if vp else None
            sp = vp.service_point if vp else None
            steps_out.append(
                RouteStepResponse(
                    id=st.id,
                    visit_progress_id=st.visit_progress_id,
                    step_order=st.step_order,
                    service_id=vp.exam_service_id if vp else "",
                    service_name=exam_serv.name if exam_serv else "",
                    service_point_id=vp.service_point_id if vp else "",
                    service_point_name=sp.name if sp else "",
                    room_number=sp.room_number if sp else "",
                    status=vp.status if vp else "NOT_STARTED",
                    estimated_wait_seconds=st.estimated_wait_seconds,
                    estimated_service_seconds=st.estimated_service_seconds
                )
            )
        return RouteResponse(
            id=route.id,
            visit_id=route.visit_id,
            version=route.version,
            creation_reason=route.creation_reason,
            status=route.status,
            suggestion_source=route.suggestion_source,
            confidence=route.confidence,
            latency_ms=route.latency_ms,
            estimated_total_duration_seconds=route.estimated_total_duration_seconds,
            created_at=route.created_at,
            steps=steps_out,
            is_better=is_better,
            message=message
        )
