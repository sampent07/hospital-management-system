import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_utc_now
from app.core.exceptions import AppException, PermissionDenied, ResourceNotFound
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.account import Account, Doctor, SystemLog
from app.models.customer import Appointment, DoctorSchedule, Patient, PatientPackageRegistration, PatientVerification
from app.repositories.patient_repository import PatientRepository
from app.schemas.auth import TokenResponse
from app.schemas.patient import (
    AppointmentCreateRequest,
    AppointmentResponse,
    LinkPatientByCodeRequest,
    PackageRegistrationCreate,
    PackageRegistrationResponse,
    PatientLookupRequest,
    PatientPackageApprovalResponse,
    PatientProfileCreate,
    PatientProfileUpdate,
    PatientRegistrationRequest,
    PatientVerificationRequest,
)
from app.schemas.visit import VisitCreateRequest
from app.schemas.visit import VisitResponse, VisitProgressResponse
from app.services.visit_service import VisitService


class PatientService:
    """Xử lý hồ sơ và các thao tác tự phục vụ của bệnh nhân."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = PatientRepository(db)

    def register(self, req: PatientRegistrationRequest) -> dict:
        """Tạo tài khoản bệnh nhân chờ xác nhận bằng mã demo."""
        if self.repo.get_account_by_username(req.username):
            raise AppException("USERNAME_EXISTS", "Tên đăng nhập đã tồn tại.", 409)
        account = Account(
            username=req.username,
            hashed_password=get_password_hash(req.password),
            full_name=req.full_name,
            role="PATIENT",
            status="PENDING",
        )
        self.db.add(account)
        self.db.flush()
        patient = Patient(
            account_id=account.id,
            full_name=req.full_name,
            date_of_birth=req.date_of_birth,
            gender=req.gender,
            marital_status=req.marital_status,
            phone_number=req.phone_number,
            email=req.email,
            address=req.address,
        )
        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = get_utc_now() + timedelta(minutes=settings.PATIENT_DEMO_VERIFICATION_TTL_MINUTES)
        self.db.add(patient)
        self.db.add(PatientVerification(
            account_id=account.id,
            code_hash=get_password_hash(code),
            expires_at=expires_at,
        ))
        self.db.commit()
        return {
            "account_id": account.id,
            "username": account.username,
            "verification_required": True,
            "demo_verification_code": code,
            "expires_at": expires_at,
        }

    def verify_registration(self, req: PatientVerificationRequest) -> TokenResponse:
        """Xác nhận đăng ký demo và cấp token cho bệnh nhân."""
        account = self.repo.get_account_by_username(req.username)
        if not account or account.role != "PATIENT":
            raise ResourceNotFound("PatientAccount", req.username)
        verification = self.repo.get_verification(account.id)
        if not verification or verification.verified_at:
            raise AppException("VERIFICATION_UNAVAILABLE", "Mã xác nhận không còn hiệu lực.", 409)
        expires_at = verification.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= get_utc_now():
            raise AppException("VERIFICATION_EXPIRED", "Mã xác nhận đã hết hạn.", 400)
        if not verify_password(req.code, verification.code_hash):
            raise AppException("INVALID_VERIFICATION_CODE", "Mã xác nhận không chính xác.", 400)
        account.status = "ACTIVE"
        verification.verified_at = get_utc_now()
        self.db.commit()
        token = create_access_token(subject=account.id, role=account.role)
        return TokenResponse(
            access_token=token,
            role=account.role,
            username=account.username,
            full_name=account.full_name,
            account_id=account.id,
        )

    def get_profile(self, account_id: str) -> Patient:
        """Trả hồ sơ bệnh nhân gắn với tài khoản hiện tại."""
        patient = self.repo.get_by_account_id(account_id)
        if not patient:
            raise ResourceNotFound("PatientProfile", account_id)
        return patient

    def list_profiles(self, account_id: str) -> List[Patient]:
        """Trả danh sách tất cả hồ sơ bệnh nhân thuộc tài khoản hiện tại."""
        profiles = self.repo.list_by_account_id(account_id)
        if not profiles:
            p = self.repo.get_by_account_id(account_id)
            if p:
                profiles = [p]
        return profiles

    def create_profile(self, account_id: str, req: PatientProfileCreate) -> Patient:
        """Tạo hồ sơ người bệnh mới gắn với tài khoản hiện tại."""
        patient = Patient(
            account_id=account_id,
            full_name=req.full_name.strip(),
            date_of_birth=req.date_of_birth,
            gender=req.gender,
            phone_number=req.phone_number.strip(),
            id_card_number=req.id_card_number.strip() if req.id_card_number else None,
            country=req.country,
            email=req.email,
            address=req.address,
            marital_status=req.marital_status,
        )
        self.db.add(patient)
        self.db.flush()
        self._log(account_id, "PATIENT_PROFILE_CREATED", "PATIENT", patient.id)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def link_by_code(self, account_id: str, req: LinkPatientByCodeRequest) -> Patient:
        """Liên kết hồ sơ bệnh nhân cũ qua mã người bệnh trên phiếu khám hoặc đơn thuốc."""
        patient = self.repo.get_by_patient_code(req.patient_code.strip())
        if not patient:
            raise ResourceNotFound("Patient", req.patient_code)
        patient.account_id = account_id
        self._log(account_id, "PATIENT_PROFILE_LINKED", "PATIENT", patient.id)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def lookup_profiles(self, account_id: str, req: PatientLookupRequest) -> List[Patient]:
        """Tra cứu tìm hồ sơ qua Họ tên, SĐT, Giới tính, hoặc số CCCD."""
        full_name = req.full_name
        if not full_name and (req.last_name or req.first_name):
            parts = [p for p in [req.last_name, req.first_name] if p]
            full_name = " ".join(parts).strip()
        return self.repo.lookup_patients(
            phone_number=req.phone_number,
            full_name=full_name,
            gender=req.gender,
            id_card_number=req.id_card_number,
        )

    def update_profile(self, account_id: str, req: PatientProfileUpdate) -> Patient:
        """Cập nhật các trường hồ sơ được bệnh nhân cho phép sửa."""
        patient = self.get_profile(account_id)
        changes = req.model_dump(exclude_unset=True)
        if "date_of_birth" in changes and changes["date_of_birth"] and changes["date_of_birth"] >= datetime.now(timezone.utc).date():
            raise AppException("INVALID_DATE_OF_BIRTH", "Ngày sinh phải trước ngày hiện tại.", 422)
        for field, value in changes.items():
            setattr(patient, field, value)
        if "full_name" in changes and patient.account:
            patient.account.full_name = changes["full_name"]
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def create_package_registration(
        self, account_id: str, req: PackageRegistrationCreate
    ) -> PackageRegistrationResponse:
        """Tạo đăng ký gói cá nhân ở trạng thái chờ điều phối viên duyệt."""
        patient = self.get_profile(account_id)
        package = self.repo.get_package(req.package_id)
        if not package or package.status != "ACTIVE" or package.package_type != "INDIVIDUAL":
            raise ResourceNotFound("IndividualPackage", req.package_id)
        registration = PatientPackageRegistration(
            patient_id=patient.id,
            package_id=package.id,
            price_snapshot=package.base_price,
            status="PENDING_APPROVAL",
            requested_at=get_utc_now(),
        )
        self.db.add(registration)
        self.db.flush()
        self._log(account_id, "PATIENT_PACKAGE_REQUESTED", "PATIENT_PACKAGE_REGISTRATION", registration.id)
        self.db.commit()
        return self._registration_response(registration, package.name)

    def list_package_registrations(self, account_id: str) -> List[PackageRegistrationResponse]:
        """Liệt kê đăng ký gói của chính bệnh nhân hiện tại."""
        patient = self.get_profile(account_id)
        return [self._registration_response(item, item.package.name) for item in self.repo.list_registrations(patient.id)]

    def list_pending_package_registrations(self) -> List[PatientPackageApprovalResponse]:
        """Liệt kê đăng ký chờ duyệt cho quy trình điều phối viên trên web."""
        return [PatientPackageApprovalResponse(
            id=item.id,
            patient_id=item.patient_id,
            patient_name=item.patient.full_name,
            package_id=item.package_id,
            package_name=item.package.name,
            price_snapshot=item.price_snapshot,
            status=item.status,
            requested_at=item.requested_at,
        ) for item in self.repo.list_pending_registrations()]

    def approve_package_registration(self, registration_id: str, actor_id: str) -> PackageRegistrationResponse:
        """Điều phối viên duyệt đăng ký gói trước bước thanh toán demo."""
        registration = self.repo.get_registration(registration_id)
        if not registration:
            raise ResourceNotFound("PatientPackageRegistration", registration_id)
        if registration.status != "PENDING_APPROVAL":
            raise AppException("INVALID_REGISTRATION_STATUS", "Chỉ đăng ký đang chờ duyệt mới được duyệt.", 409)
        registration.status = "APPROVED"
        registration.reviewed_by_id = actor_id
        registration.reviewed_at = get_utc_now()
        self._log(actor_id, "PATIENT_PACKAGE_APPROVED", "PATIENT_PACKAGE_REGISTRATION", registration.id)
        self.db.commit()
        return self._registration_response(registration, registration.package.name)

    def complete_demo_payment(self, account_id: str, registration_id: str) -> PackageRegistrationResponse:
        """Ghi nhận thanh toán thành công giả lập cho đăng ký đã duyệt."""
        patient = self.get_profile(account_id)
        registration = self.repo.get_registration(registration_id)
        if not registration or registration.patient_id != patient.id:
            raise ResourceNotFound("PatientPackageRegistration", registration_id)
        if registration.status != "APPROVED":
            raise AppException("INVALID_REGISTRATION_STATUS", "Đăng ký phải được điều phối viên duyệt trước.", 409)
        registration.status = "PAID"
        registration.payment_method = "DEMO"
        registration.paid_at = get_utc_now()
        self._log(account_id, "PATIENT_PACKAGE_DEMO_PAID", "PATIENT_PACKAGE_REGISTRATION", registration.id)
        self.db.commit()
        return self._registration_response(registration, registration.package.name)

    def create_appointment(self, account_id: str, req: AppointmentCreateRequest) -> AppointmentResponse:
        """Đặt lịch khám và phát hành mã hẹn dùng làm nội dung QR."""
        if req.appointment_time.tzinfo is None:
            raise AppException("TIMEZONE_REQUIRED", "Thời gian lịch hẹn phải có múi giờ.", 422)

        now_utc = get_utc_now()
        if req.appointment_time < now_utc:
            raise AppException("APPOINTMENT_IN_PAST", "Không thể đặt lịch khám trong quá khứ. Vui lòng chọn ngày giờ ở tương lai.", 422)

        from app.core.database import get_facility_tz
        facility_tz = get_facility_tz()
        appt_facility = req.appointment_time.astimezone(facility_tz)

        # Ràng buộc 1: Bệnh viện không làm việc vào ngày Chủ nhật
        if appt_facility.weekday() == 6:
            raise AppException(
                "SUNDAY_NOT_ALLOWED",
                "Bệnh viện không tiếp nhận khám bệnh vào ngày Chủ nhật. Vui lòng chọn ngày khám từ Thứ Hai đến Thứ Bảy.",
                422
            )

        # Ràng buộc 2: Khung giờ làm việc cố định (Sáng 06:30 - 11:00, Chiều 13:30 - 15:30)
        hour = appt_facility.hour
        minute = appt_facility.minute
        time_minutes = hour * 60 + minute

        is_morning = (6 * 60 + 30) <= time_minutes <= (11 * 60)
        is_afternoon = (13 * 60 + 30) <= time_minutes <= (15 * 60 + 30)

        if appt_facility.weekday() == 5:
            # Thứ Bảy: Chỉ tiếp nhận khám buổi sáng (06:30 - 11:00)
            if not is_morning:
                raise AppException(
                    "SATURDAY_MORNING_ONLY",
                    "Thứ Bảy bệnh viện chỉ tiếp nhận khám buổi sáng (06:30 - 11:00). Vui lòng chọn khung giờ buổi sáng.",
                    422
                )
        else:
            # Thứ Hai đến Thứ Sáu: Sáng (06:30 - 11:00) hoặc Chiều (13:30 - 15:30)
            if not (is_morning or is_afternoon):
                raise AppException(
                    "OUTSIDE_OPERATING_HOURS",
                    "Giờ hẹn khám phải nằm trong giờ làm việc: Buổi sáng (06:30 - 11:00) hoặc Buổi chiều (13:30 - 15:30).",
                    422
                )

        if req.patient_id:
            patient = self.db.query(Patient).filter(Patient.id == req.patient_id).first()
            if not patient or (patient.account_id and patient.account_id != account_id):
                raise ResourceNotFound("Patient", req.patient_id)
        else:
            patient = self.get_profile(account_id)

        package_id = req.package_id
        registration_id = req.package_registration_id

        if registration_id:
            registration = self.repo.get_registration(registration_id)
            if not registration or registration.patient_id != patient.id:
                raise ResourceNotFound("PatientPackageRegistration", registration_id)
            if registration.status != "PAID":
                raise AppException("PACKAGE_NOT_PAID", "Chỉ gói đã thanh toán demo mới được đặt lịch.", 409)
            package_id = registration.package_id
        elif package_id:
            package = self.repo.get_package(package_id)
            if not package or package.status != "ACTIVE":
                raise ResourceNotFound("Package", package_id)
        else:
            raise AppException("PACKAGE_REQUIRED", "Vui lòng chọn gói khám.", 422)

        # Ràng buộc chống đặt trùng lịch đang chờ khám cho cùng bệnh nhân và gói khám
        existing_active = self.db.query(Appointment).filter(
            Appointment.patient_id == patient.id,
            Appointment.package_id == package_id,
            Appointment.status == "CONFIRMED",
            Appointment.appointment_time >= now_utc
        ).first()
        if existing_active:
            raise AppException(
                "DUPLICATE_APPOINTMENT",
                "Hồ sơ người bệnh này đã có một lịch hẹn đang chờ khám cho gói này. Vui lòng hoàn tất hoặc hủy lịch cũ trước khi đặt mới.",
                409
            )

        appointment_code = f"APT-{secrets.token_hex(6).upper()}"
        schedule_id = req.doctor_schedule_id
        doc_id = None
        if schedule_id:
            sched = self.db.query(DoctorSchedule).filter(DoctorSchedule.id == schedule_id).first()
            if sched:
                # Kiểm tra ngày và giờ có khớp với lịch của bác sĩ không
                slot_hour, slot_min = map(int, sched.start_time.split(":"))
                if appt_facility.date() != sched.work_date or appt_facility.hour != slot_hour or appt_facility.minute != slot_min:
                    raise AppException(
                        "SCHEDULE_TIME_MISMATCH",
                        f"Thời gian hẹn không khớp với khung giờ đã chọn của bác sĩ ({sched.start_time} ngày {sched.work_date}).",
                        422
                    )

                if sched.current_booked >= sched.max_slots:
                    raise AppException("SCHEDULE_FULL", "Khung giờ khám này đã hết chỗ, vui lòng chọn khung giờ hoặc ngày khác.", 409)
                sched.current_booked += 1
                if sched.current_booked >= sched.max_slots:
                    sched.status = "FULL"
                doc_id = sched.doctor_id

        appointment = Appointment(
            patient_id=patient.id,
            package_id=package_id,
            package_registration_id=registration_id,
            doctor_schedule_id=schedule_id,
            doctor_id=doc_id,
            appointment_time=req.appointment_time.astimezone(timezone.utc),
            appointment_type="PACKAGE",
            appointment_code=appointment_code,
            notes=req.notes,
            status="CONFIRMED",
        )
        self.db.add(appointment)
        self._log(account_id, "PATIENT_APPOINTMENT_BOOKED", "APPOINTMENT", appointment.id)
        self.db.commit()
        return self._appointment_response(appointment)

    def list_appointments(self, account_id: str) -> List[AppointmentResponse]:
        """Liệt kê lịch hẹn thuộc các hồ sơ của bệnh nhân hiện tại."""
        profiles = self.list_profiles(account_id)
        patient_ids = [p.id for p in profiles]
        if not patient_ids:
            return []
        appointments = self.db.query(Appointment).filter(
            Appointment.patient_id.in_(patient_ids)
        ).order_by(Appointment.appointment_time.desc()).all()
        return [self._appointment_response(item) for item in appointments]

    def check_in(self, account_id: str, appointment_code: str):
        """Check-in bằng mã nhập hoặc QR payload và tạo tối đa một lượt khám."""
        patient = self.get_profile(account_id)
        appointment = self.repo.get_appointment_by_code(appointment_code.strip().upper())
        if not appointment or appointment.patient_id != patient.id:
            raise ResourceNotFound("Appointment", appointment_code)
        existing_visit = self.repo.get_visit_for_appointment(appointment.id)
        if existing_visit:
            return existing_visit
        if appointment.status != "CONFIRMED":
            raise AppException("APPOINTMENT_NOT_CHECKINABLE", "Lịch hẹn chưa ở trạng thái có thể check-in.", 409)

        # Ràng buộc ngày khám: Bệnh nhân chỉ được check-in vào đúng ngày hẹn (múi giờ cơ sở)
        from app.core.database import get_facility_tz
        facility_tz = get_facility_tz()
        now_facility = get_utc_now().astimezone(facility_tz)

        appt_time = appointment.appointment_time
        if appt_time.tzinfo is None:
            appt_time = appt_time.replace(tzinfo=timezone.utc)
        appt_facility = appt_time.astimezone(facility_tz)

        if appt_facility.date() > now_facility.date():
            formatted_date = appt_facility.strftime("%d/%m/%Y")
            raise AppException(
                "APPOINTMENT_NOT_TODAY",
                f"Chưa đến ngày hẹn khám. Lịch hẹn của bạn vào ngày {formatted_date}. Quý khách vui lòng check-in vào đúng ngày hẹn khám.",
                400
            )

        if appt_facility.date() < now_facility.date():
            raise AppException(
                "APPOINTMENT_EXPIRED",
                "Lịch hẹn khám này đã quá hạn và không thể check-in.",
                400
            )

        visit_service = VisitService(self.db)
        visit = visit_service.create_visit(
            VisitCreateRequest(
                patient_id=patient.id,
                package_id=appointment.package_id,
                visit_type="PACKAGE",
                reception_channel="APP",
                is_priority=False,
            ),
            creator_id=account_id,
            appointment_id=appointment.id,
            commit=False,
        )
        appointment.status = "CHECKED_IN"
        self._log(account_id, "PATIENT_APPOINTMENT_CHECKED_IN", "APPOINTMENT", appointment.id)
        self.db.commit()
        return visit

    def list_visits(self, account_id: str) -> List[VisitResponse]:
        """Liệt kê các lượt khám thuộc hồ sơ của bệnh nhân hiện tại."""
        patient = self.get_profile(account_id)
        return [self._visit_response(visit) for visit in self.repo.list_visits(patient.id)]

    def get_owned_visit(self, account_id: str, visit_id: str) -> VisitResponse:
        """Tìm một lượt khám và xác nhận quyền sở hữu trước khi trả dữ liệu."""
        patient = self.get_profile(account_id)
        from app.repositories.visit_repository import VisitRepository
        visit = VisitRepository(self.db).get_visit_with_details(visit_id)
        if not visit or visit.patient_id != patient.id:
            raise ResourceNotFound("Visit", visit_id)
        return self._visit_response(visit)

    def _registration_response(self, registration, package_name: str) -> PackageRegistrationResponse:
        return PackageRegistrationResponse(
            id=registration.id,
            patient_id=registration.patient_id,
            package_id=registration.package_id,
            package_name=package_name,
            price_snapshot=registration.price_snapshot,
            status=registration.status,
            requested_at=registration.requested_at,
            reviewed_by_id=registration.reviewed_by_id,
            reviewed_at=registration.reviewed_at,
            paid_at=registration.paid_at,
            payment_method=registration.payment_method,
        )

    def _appointment_response(self, appointment: Appointment) -> AppointmentResponse:
        from app.core.database import get_facility_tz
        facility_tz = get_facility_tz()

        now_utc = get_utc_now()
        appt_time = appointment.appointment_time
        if appt_time.tzinfo is None:
            appt_time = appt_time.replace(tzinfo=timezone.utc)

        now_facility = now_utc.astimezone(facility_tz)
        appt_facility = appt_time.astimezone(facility_tz)

        now_date = now_facility.date()
        appt_date = appt_facility.date()

        raw_status = appointment.status

        # Lấy thông tin lượt khám liên kết nếu có
        visit = self.repo.get_visit_for_appointment(appointment.id)
        is_visit_completed = visit is not None and visit.status == "COMPLETED"
        is_visit_in_progress = visit is not None and visit.status in ("IN_PROGRESS", "WAITING")

        # Ràng buộc trạng thái theo thời gian thực:
        if raw_status == "CANCELLED":
            status = "CANCELLED"
        elif is_visit_completed:
            status = "CHECKED_IN"  # Đã hoàn tất khám (Đã sử dụng)
        elif appt_date > now_date:
            # Lịch hẹn ở tương lai -> Bắt buộc là Chờ khám (CONFIRMED), KHÔNG THỂ là Đã sử dụng hay Hết hạn
            status = "CONFIRMED"
        elif appt_date == now_date:
            # Lịch hẹn trong ngày hôm nay
            if is_visit_in_progress or raw_status == "CHECKED_IN":
                status = "CHECKED_IN"  # Đang thực hiện khám
            else:
                status = "CONFIRMED"  # Chờ khám trong ngày
        else:
            # appt_date < now_date (Đã qua ngày khám)
            if raw_status == "CHECKED_IN" or visit is not None:
                status = "CHECKED_IN"  # Đã sử dụng
            else:
                status = "EXPIRED"  # Quá hạn mà chưa check-in -> Hết hạn

        # Lấy thông tin Bác sĩ & Gói khám kèm theo
        pkg_name = None
        if appointment.package_id:
            pkg = self.repo.get_package(appointment.package_id)
            if pkg:
                pkg_name = pkg.name

        doc_name = None
        specialty = None
        room_no = None
        room_nm = None

        if appointment.schedule and appointment.schedule.doctor:
            doc = appointment.schedule.doctor
            doc_name = doc.staff_member.account.full_name if (doc.staff_member and doc.staff_member.account) else None
            specialty = doc.specialty
            if appointment.schedule.service_point:
                room_no = appointment.schedule.service_point.room_number
                room_nm = appointment.schedule.service_point.name
        elif appointment.doctor_id:
            doc = self.db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
            if doc:
                doc_name = doc.staff_member.account.full_name if (doc.staff_member and doc.staff_member.account) else None
                specialty = doc.specialty

        pat_name = None
        if appointment.patient_id:
            pat = self.db.query(Patient).filter(Patient.id == appointment.patient_id).first()
            if pat:
                pat_name = pat.full_name

        return AppointmentResponse(
            id=appointment.id,
            patient_id=appointment.patient_id,
            patient_name=pat_name,
            package_id=appointment.package_id,
            package_name=pkg_name,
            doctor_id=appointment.doctor_id,
            doctor_name=doc_name,
            specialty=specialty,
            room_number=room_no,
            room_name=room_nm,
            doctor_schedule_id=appointment.doctor_schedule_id,
            appointment_time=appt_time,
            appointment_type=appointment.appointment_type,
            appointment_code=appointment.appointment_code or "",
            qr_payload=appointment.appointment_code or "",
            status=status,
        )

    def _visit_response(self, visit) -> VisitResponse:
        return VisitResponse(
            id=visit.id,
            visit_code=visit.visit_code,
            patient_id=visit.patient_id,
            patient_name=visit.patient.full_name if visit.patient else None,
            package_id=visit.package_id,
            package_name=visit.package.name if visit.package else None,
            visit_type=visit.visit_type,
            reception_channel=visit.reception_channel,
            is_priority=visit.is_priority,
            queue_number=visit.queue_number,
            status=visit.status,
            check_in_at=visit.check_in_at,
            completed_at=visit.completed_at,
            progress_items=[VisitProgressResponse(
                id=item.id,
                visit_id=item.visit_id,
                exam_service_id=item.exam_service_id,
                service_name=item.exam_service.name if item.exam_service else None,
                service_point_id=item.service_point_id,
                service_point_name=item.service_point.name if item.service_point else None,
                service_source=item.service_source,
                status=item.status,
                assigned_at=item.assigned_at,
                queued_at=item.queued_at,
                started_at=item.started_at,
                completed_at=item.completed_at,
                version=item.version,
            ) for item in visit.progress_items],
        )

    def _log(self, actor_id: str, action_type: str, target_type: str, target_id: str) -> None:
        self.db.add(SystemLog(
            actor_id=actor_id,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            details={"source": "PATIENT_APP"},
            created_at=get_utc_now(),
        ))
