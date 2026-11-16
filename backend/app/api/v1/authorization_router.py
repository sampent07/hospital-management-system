from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import require_permission, get_current_user_payload
from app.services.authorization_service import AuthorizationService
from app.schemas.authorization import (
    AuthorizationCreate,
    AuthorizationResponse,
)

router = APIRouter(prefix="/authorizations", tags=["Ủy quyền Bác sĩ & Thư ký"])


@router.get("", response_model=List[AuthorizationResponse], summary="Xem danh sách ủy quyền")
def list_authorizations(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = AuthorizationService(db)
    return service.list_authorizations(
        current_user_id=payload.get("sub"),
        role=payload.get("role", "")
    )


@router.post("", response_model=AuthorizationResponse, summary="Bác sĩ tạo ủy quyền cho Thư ký")
def create_authorization(
    req: AuthorizationCreate,
    payload: dict = Depends(require_permission("authorization:create")),
    db: Session = Depends(get_db)
):
    service = AuthorizationService(db)
    return service.create_authorization(
        doctor_account_id=payload.get("sub"),
        req=req
    )


@router.put("/{authorization_id}/accept", response_model=AuthorizationResponse, summary="Thư ký tiếp nhận ủy quyền")
def accept_authorization(
    authorization_id: str,
    payload: dict = Depends(require_permission("authorization:accept")),
    db: Session = Depends(get_db)
):
    service = AuthorizationService(db)
    return service.accept_authorization(
        auth_id=authorization_id,
        coordinator_account_id=payload.get("sub")
    )


@router.put("/{authorization_id}/revoke", response_model=AuthorizationResponse, summary="Bác sĩ thu hồi ủy quyền")
def revoke_authorization(
    authorization_id: str,
    payload: dict = Depends(require_permission("authorization:create")),
    db: Session = Depends(get_db)
):
    service = AuthorizationService(db)
    return service.revoke_authorization(
        auth_id=authorization_id,
        doctor_account_id=payload.get("sub")
    )
