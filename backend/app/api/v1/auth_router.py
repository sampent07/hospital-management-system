from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import get_current_user_payload
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, TokenResponse, RegisterStaffRequest, AccountResponse, ProfileUpdateRequest
from app.repositories.account_repository import AccountRepository

router = APIRouter(prefix="/auth", tags=["Xác thực & Tài khoản"])


@router.post("/login", response_model=TokenResponse, summary="Đăng nhập hệ thống")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Xác thực người dùng và cấp JWT Bearer token."""
    service = AuthService(db)
    return service.authenticate_user(req)


@router.post("/register-staff", response_model=AccountResponse, summary="Đăng ký tài khoản nhân viên")
def register_staff(req: RegisterStaffRequest, db: Session = Depends(get_db)):
    """Nhân viên tự đăng ký tài khoản (Bác sĩ hoặc Thư ký)."""
    service = AuthService(db)
    account = service.register_staff(req)
    return service.get_account_profile(account.id)


@router.get("/me", response_model=AccountResponse, summary="Xem thông tin tài khoản hiện tại")
def get_current_user(
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    return service.get_account_profile(payload.get("sub"))


@router.put("/me", response_model=AccountResponse, summary="Cập nhật thông tin cá nhân")
def update_current_user_profile(
    req: ProfileUpdateRequest,
    payload: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    service = AuthService(db)
    return service.update_profile(
        account_id=payload.get("sub"),
        full_name=req.full_name,
        phone_number=req.phone_number,
        email=req.email
    )
