from typing import Optional
from sqlalchemy.orm import Session
from app.models.account import Account, StaffMember, Doctor
from app.repositories.account_repository import AccountRepository
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import AppException, ResourceNotFound
from app.core.database import get_utc_now
from app.schemas.auth import LoginRequest, TokenResponse, RegisterStaffRequest


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AccountRepository(db)

    def authenticate_user(self, req: LoginRequest) -> TokenResponse:
        account = self.repo.get_by_username(req.username)
        if not account or not verify_password(req.password, account.hashed_password):
            raise AppException(code="INVALID_CREDENTIALS", message="Tên đăng nhập hoặc mật khẩu không chính xác.", status_code=401)

        if account.status != "ACTIVE":
            raise AppException(code="ACCOUNT_INACTIVE", message=f"Tài khoản đang ở trạng thái '{account.status}'.", status_code=403)

        # Cập nhật lần đăng nhập cuối
        account.last_login_at = get_utc_now()
        self.db.commit()

        token = create_access_token(subject=account.id, role=account.role)
        return TokenResponse(
            access_token=token,
            role=account.role,
            username=account.username,
            full_name=account.full_name,
            account_id=account.id
        )

    def register_staff(self, req: RegisterStaffRequest) -> Account:
        if self.repo.get_by_username(req.username):
            raise AppException(code="USERNAME_EXISTS", message="Tên đăng nhập đã tồn tại.", status_code=400)

        if req.staff_type not in ["DOCTOR", "COORDINATOR"]:
            raise AppException(code="INVALID_ROLE", message="Nhân viên chỉ có thể đăng ký vai trò DOCTOR hoặc COORDINATOR.", status_code=400)

        new_acc = Account(
            username=req.username,
            hashed_password=get_password_hash(req.password),
            full_name=req.full_name,
            employee_code=req.employee_code,
            role=req.staff_type,
            status="ACTIVE"  # Để tiện test/demo, kích hoạt luôn
        )
        self.db.add(new_acc)
        self.db.flush()

        staff_profile = StaffMember(
            id=new_acc.id,
            staff_type=req.staff_type,
            phone_number=req.phone_number,
            email=req.email
        )
        self.db.add(staff_profile)
        self.db.flush()

        if req.staff_type == "DOCTOR":
            doc = Doctor(
                id=new_acc.id,
                specialty=req.specialty or "Đa khoa",
                license_number=req.license_number or "CCHN-DEFAULT"
            )
            self.db.add(doc)

        self.db.commit()
        return new_acc
