from typing import Callable, List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.exceptions import PermissionDenied

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login", auto_error=False)

# BẢNG GÁN QUYỀN CHO VAI TRÒ ĐẶT TẠI MỘT NƠI DUY NHẤT (DOMAIN_RULES Mục 11)
ROLE_PERMISSIONS = {
    "ADMIN": {
        "admin:all",
        "account:manage",
        "account:view",
        "package:manage",
        "service:manage",
        "constraint:manage",
        "company:manage",
        "system:config",
        "dashboard:view",
        "logs:view",
        "queue:view_all",
    },
    "COORDINATOR": {
        "visit:create",
        "visit:receive",
        "visit:view",
        "progress:update_status",
        "progress:undo",
        "queue:view",
        "route:support_recalc",
        "route:proxy_decision",
        "account:view_profile",
    },
    "DOCTOR": {
        "visit:create",
        "visit:receive",
        "visit:view",
        "progress:update_status",
        "progress:undo",
        "queue:view",
        "route:support_recalc",
        "route:proxy_decision",
        "service_order:create",      # ĐẶC QUYỀN: Chỉ Doctor mới được chỉ định dịch vụ!
        "clinical:record_result",
        "clinical:diagnose",
        "clinical:prescribe",
        "clinical:conclude",
        "account:view_profile",
    },
    "PATIENT": {
        "visit:self_view",
        "route:self_recalc",
        "route:self_decide",
        "package:self_view",
        "queue:self_view",
        "account:view_profile",
    }
}


def get_current_user_payload(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """Dependency lấy thông tin JWT payload của người dùng hiện tại."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu xác thực tài khoản.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def require_permission(permission_name: str) -> Callable:
    """Dependency kiểm tra người dùng có quyền cụ thể hay không."""
    def permission_checker(payload: dict = Depends(get_current_user_payload)) -> dict:
        role = payload.get("role", "")
        allowed_permissions = ROLE_PERMISSIONS.get(role, set())
        
        # Admin có quyền tối cao admin:all
        if "admin:all" in allowed_permissions or permission_name in allowed_permissions:
            return payload
            
        raise PermissionDenied(f"Vai trò '{role}' không có quyền '{permission_name}'.")
        
    return permission_checker
