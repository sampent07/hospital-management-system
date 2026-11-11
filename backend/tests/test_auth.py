import pytest
from app.services.auth_service import AuthService
from app.schemas.auth import LoginRequest, RegisterStaffRequest
from app.core.exceptions import AppException


def test_auth_login_success(db_session):
    service = AuthService(db_session)
    req = LoginRequest(username="admin", password="Admin@123")
    res = service.authenticate_user(req)
    assert res.access_token is not None
    assert res.role == "ADMIN"
    assert res.username == "admin"


def test_auth_login_invalid_password(db_session):
    service = AuthService(db_session)
    req = LoginRequest(username="admin", password="WrongPassword")
    with pytest.raises(AppException) as exc:
        service.authenticate_user(req)
    assert exc.value.code == "INVALID_CREDENTIALS"
