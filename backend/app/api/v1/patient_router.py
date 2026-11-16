from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.permissions import require_permission
from app.repositories.route_repository import RouteRepository
from app.schemas.patient import (
    AppointmentCreateRequest,
    AppointmentResponse,
    CheckInRequest,
    LinkPatientByCodeRequest,
    PackageRegistrationCreate,
    PackageRegistrationResponse,
    PatientLookupRequest,
    PatientPackageApprovalResponse,
    PatientProfileCreate,
    PatientProfileResponse,
    PatientProfileUpdate,
)
from app.schemas.route import RouteResponse
from app.schemas.queue import PatientQueueSummary
from app.schemas.visit import VisitResponse
from app.services.patient_service import PatientService
from app.services.route_service import RouteService
from app.services.queue_service import QueueService
from app.core.exceptions import ResourceNotFound

router = APIRouter(tags=["Nghiệp vụ bệnh nhân"])
# v2.0 - profiles endpoints added


@router.get("/patients/me/queues", response_model=List[PatientQueueSummary], summary="Hàng đợi tổng hợp không định danh")
def get_patient_queues(
    payload: dict = Depends(require_permission("queue:self_view")),
    db: Session = Depends(get_db),
):
    """Chỉ trả số lượng và thời gian ước tính, không trả thông tin bệnh nhân khác."""
    return QueueService(db).get_patient_queue_summaries()


@router.get("/patients/me", response_model=PatientProfileResponse, summary="Xem hồ sơ của tôi")
def get_my_profile(
    payload: dict = Depends(require_permission("account:self_view")),
    db: Session = Depends(get_db),
):
    """Trả hồ sơ gắn với tài khoản hiện tại, không nhận patient ID từ client."""
    return PatientService(db).get_profile(payload["sub"])


@router.get("/patients/me/profiles", response_model=List[PatientProfileResponse], summary="Danh sách hồ sơ của tôi")
def list_my_profiles(
    payload: dict = Depends(require_permission("account:self_view")),
    db: Session = Depends(get_db),
):
    """Liệt kê toàn bộ hồ sơ người bệnh thuộc quản lý của tài khoản hiện tại."""
    return PatientService(db).list_profiles(payload["sub"])


@router.post("/patients/me/profiles", response_model=PatientProfileResponse, status_code=201, summary="Tạo hồ sơ người bệnh mới")
def create_my_profile(
    req: PatientProfileCreate,
    payload: dict = Depends(require_permission("account:self_update")),
    db: Session = Depends(get_db),
):
    """Tạo hồ sơ bệnh nhân mới gắn vào tài khoản."""
    return PatientService(db).create_profile(payload["sub"], req)


@router.post("/patients/me/link-by-code", response_model=PatientProfileResponse, summary="Liên kết hồ sơ bằng mã người bệnh")
def link_profile_by_code(
    req: LinkPatientByCodeRequest,
    payload: dict = Depends(require_permission("account:self_update")),
    db: Session = Depends(get_db),
):
    """Liên kết hồ sơ cũ bằng mã trên phiếu khám hoặc đơn thuốc."""
    return PatientService(db).link_by_code(payload["sub"], req)


@router.post("/patients/me/lookup", response_model=List[PatientProfileResponse], summary="Tìm kiếm hồ sơ theo thông tin cá nhân")
def lookup_patient_profiles(
    req: PatientLookupRequest,
    payload: dict = Depends(require_permission("account:self_view")),
    db: Session = Depends(get_db),
):
    """Tra cứu hồ sơ đã từng khám theo Họ tên, SĐT, Giới tính hoặc CCCD."""
    return PatientService(db).lookup_profiles(payload["sub"], req)


@router.patch("/patients/me", response_model=PatientProfileResponse, summary="Cập nhật hồ sơ của tôi")
def update_my_profile(
    req: PatientProfileUpdate,
    payload: dict = Depends(require_permission("account:self_update")),
    db: Session = Depends(get_db),
):
    """Cập nhật các trường hồ sơ của chính bệnh nhân đang đăng nhập."""
    return PatientService(db).update_profile(payload["sub"], req)


@router.get("/patients/me/package-registrations", response_model=List[PackageRegistrationResponse], summary="Danh sách đăng ký gói của tôi")
def list_my_package_registrations(
    payload: dict = Depends(require_permission("package:self_view")),
    db: Session = Depends(get_db),
):
    """Liệt kê các đăng ký gói cá nhân của tài khoản hiện tại."""
    return PatientService(db).list_package_registrations(payload["sub"])


@router.post("/patients/me/package-registrations", response_model=PackageRegistrationResponse, status_code=201, summary="Đăng ký gói khám")
def create_my_package_registration(
    req: PackageRegistrationCreate,
    payload: dict = Depends(require_permission("package_registration:self_create")),
    db: Session = Depends(get_db),
):
    """Đăng ký một gói cá nhân để điều phối viên duyệt."""
    return PatientService(db).create_package_registration(payload["sub"], req)


@router.post("/package-registrations/{registration_id}/approve", response_model=PackageRegistrationResponse, summary="Điều phối viên duyệt đăng ký gói")
def approve_package_registration(
    registration_id: str,
    payload: dict = Depends(require_permission("package_registration:approve")),
    db: Session = Depends(get_db),
):
    """Duyệt đăng ký gói cá nhân và mở bước thanh toán demo."""
    return PatientService(db).approve_package_registration(registration_id, payload["sub"])


@router.get("/package-registrations/pending", response_model=List[PatientPackageApprovalResponse], summary="Đăng ký gói đang chờ duyệt")
def list_pending_package_registrations(
    payload: dict = Depends(require_permission("package_registration:approve")),
    db: Session = Depends(get_db),
):
    """Cung cấp danh sách chờ duyệt cho quy trình nhân viên/điều phối viên."""
    return PatientService(db).list_pending_package_registrations()


@router.post("/patients/me/package-registrations/{registration_id}/pay-demo", response_model=PackageRegistrationResponse, summary="Xác nhận thanh toán demo")
def complete_demo_payment(
    registration_id: str,
    payload: dict = Depends(require_permission("package_registration:self_pay")),
    db: Session = Depends(get_db),
):
    """Ghi nhận thành công giả lập; không kết nối cổng hay thu tiền thật."""
    return PatientService(db).complete_demo_payment(payload["sub"], registration_id)


@router.get("/patients/me/appointments", response_model=List[AppointmentResponse], summary="Danh sách lịch hẹn của tôi")
def list_my_appointments(
    payload: dict = Depends(require_permission("appointment:self_manage")),
    db: Session = Depends(get_db),
):
    """Liệt kê lịch hẹn thuộc tài khoản hiện tại."""
    return PatientService(db).list_appointments(payload["sub"])


@router.post("/patients/me/appointments", response_model=AppointmentResponse, status_code=201, summary="Đặt lịch khám theo gói đã thanh toán")
def create_my_appointment(
    req: AppointmentCreateRequest,
    payload: dict = Depends(require_permission("appointment:self_manage")),
    db: Session = Depends(get_db),
):
    """Tạo lịch hẹn và mã dùng chung cho nhập tay hoặc QR."""
    return PatientService(db).create_appointment(payload["sub"], req)


@router.post("/patients/me/appointments/check-in", response_model=VisitResponse, summary="Check-in bằng mã hẹn hoặc QR")
def check_in_appointment(
    req: CheckInRequest,
    payload: dict = Depends(require_permission("appointment:self_manage")),
    db: Session = Depends(get_db),
):
    """Kiểm tra quyền sở hữu và tạo tối đa một visit cho lịch hẹn."""
    return PatientService(db).check_in(payload["sub"], req.appointment_code)


@router.get("/patients/me/visits", response_model=List[VisitResponse], summary="Lượt khám của tôi")
def list_my_visits(
    payload: dict = Depends(require_permission("visit:self_view")),
    db: Session = Depends(get_db),
):
    """Liệt kê lượt khám của hồ sơ bệnh nhân đang đăng nhập."""
    return PatientService(db).list_visits(payload["sub"])


@router.get("/patients/me/visits/{visit_id}", response_model=VisitResponse, summary="Chi tiết lượt khám của tôi")
def get_my_visit(
    visit_id: str,
    payload: dict = Depends(require_permission("visit:self_view")),
    db: Session = Depends(get_db),
):
    """Trả chi tiết lượt khám sau khi kiểm tra chủ sở hữu."""
    return PatientService(db).get_owned_visit(payload["sub"], visit_id)


@router.get("/patients/me/visits/{visit_id}/active-route", response_model=RouteResponse, summary="Lộ trình đang áp dụng của tôi")
def get_my_active_route(
    visit_id: str,
    payload: dict = Depends(require_permission("visit:self_view")),
    db: Session = Depends(get_db),
):
    """Trả lộ trình đang áp dụng của lượt khám thuộc bệnh nhân hiện tại."""
    PatientService(db).get_owned_visit(payload["sub"], visit_id)
    route = RouteRepository(db).get_active_route_for_visit(visit_id)
    if not route:
        raise ResourceNotFound("ActiveRoute", visit_id)
    return RouteService(db)._build_route_response(route)


@router.post("/patients/me/visits/{visit_id}/start-route", response_model=RouteResponse, summary="Tạo lộ trình ban đầu")
async def start_my_route(
    visit_id: str,
    payload: dict = Depends(require_permission("visit:self_view")),
    db: Session = Depends(get_db),
):
    """Tạo lộ trình ban đầu cho visit của bệnh nhân hiện tại."""
    PatientService(db).get_owned_visit(payload["sub"], visit_id)
    return await RouteService(db).calculate_or_recalculate_route(
        visit_id, is_initial=True, actor_id=payload["sub"]
    )


