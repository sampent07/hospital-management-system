from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.permissions import require_permission
from app.models.account import Account, SystemLog
from app.models.service import ServicePoint
from app.models.visit import Visit, VisitProgress
from app.schemas.auth import AccountResponse

router = APIRouter(prefix="/admin", tags=["Quản trị viên (Admin)"])


@router.get("/accounts", response_model=List[AccountResponse], summary="Quản lý danh sách tài khoản")
def list_accounts(
    payload: dict = Depends(require_permission("account:manage")),
    db: Session = Depends(get_db)
):
    accounts = db.query(Account).all()
    return accounts


@router.put("/accounts/{account_id}/role", response_model=AccountResponse, summary="Thay đổi vai trò và gán điểm dịch vụ")
def update_account_role(
    account_id: str,
    new_role: str,
    service_point_id: str = None,
    payload: dict = Depends(require_permission("account:manage")),
    db: Session = Depends(get_db)
):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        from app.core.exceptions import ResourceNotFound
        raise ResourceNotFound("Account", account_id)

    acc.role = new_role
    if service_point_id:
        acc.assigned_service_point_id = service_point_id

    db.commit()
    db.refresh(acc)
    return acc


@router.get("/dashboard-stats", summary="Thống kê Dashboard toàn viện")
def get_dashboard_stats(
    payload: dict = Depends(require_permission("dashboard:view")),
    db: Session = Depends(get_db)
):
    total_visits = db.query(Visit).count()
    completed_visits = db.query(Visit).filter(Visit.status == "COMPLETED").count()
    active_visits = db.query(Visit).filter(Visit.status.in_(["REGISTERED", "IN_PROGRESS"])).count()
    total_service_points = db.query(ServicePoint).filter(ServicePoint.status == "ACTIVE").count()

    return {
        "total_visits_today": total_visits,
        "completed_visits": completed_visits,
        "active_visits": active_visits,
        "active_service_points": total_service_points,
        "avg_stay_duration_minutes": 45  # Ước lượng mẫu
    }
