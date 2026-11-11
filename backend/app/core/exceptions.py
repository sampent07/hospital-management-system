from typing import Any, Dict, Optional
from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):
    """Lớp Exception cơ sở cho mọi ngoại lệ nghiệp vụ của hệ thống."""
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: Optional[Dict[str, Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class InvalidStatusTransition(AppException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="INVALID_STATUS_TRANSITION",
            message=message,
            status_code=400,
            details=details
        )


class ConstraintViolation(AppException):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="CONSTRAINT_VIOLATION",
            message=message,
            status_code=400,
            details=details
        )


class QueueFull(AppException):
    def __init__(self, message: str = "Hàng đợi tại điểm dịch vụ đã đầy.", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            code="QUEUE_FULL",
            message=message,
            status_code=409,
            details=details
        )


class ResourceNotFound(AppException):
    def __init__(self, resource_name: str, resource_id: Any):
        super().__init__(
            code="RESOURCE_NOT_FOUND",
            message=f"Không tìm thấy tài nguyên {resource_name} với ID '{resource_id}'.",
            status_code=404,
            details={"resource": resource_name, "id": str(resource_id)}
        )


class PermissionDenied(AppException):
    def __init__(self, message: str = "Bạn không có quyền thực hiện thao tác này."):
        super().__init__(
            code="PERMISSION_DENIED",
            message=message,
            status_code=403
        )


class ConcurrentUpdateError(AppException):
    def __init__(self, message: str = "Dữ liệu đã bị cập nhật bởi người khác, vui lòng làm mới trang."):
        super().__init__(
            code="CONCURRENT_UPDATE_CONFLICT",
            message=message,
            status_code=409
        )


class UndoWindowExpired(AppException):
    def __init__(self, message: str = "Đã quá thời gian cho phép hoàn tác thao tác (60 giây)."):
        super().__init__(
            code="UNDO_WINDOW_EXPIRED",
            message=message,
            status_code=400
        )


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handler toàn cục chuyển đổi AppException thành chuẩn JSON thống nhất."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "code": exc.code,
            "message": exc.message,
            "details": exc.details
        }
    )
