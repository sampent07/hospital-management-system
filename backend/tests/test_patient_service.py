from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
import pytest
from app.core.exceptions import AppException, ResourceNotFound
from app.models.account import Account
from app.models.customer import Appointment, Patient
from app.models.package import Package, PackageServiceItem, PackageTier
from app.models.service import ExamService
from app.models.account import SystemLog
from app.schemas.patient import (
    AppointmentCreateRequest,
    LinkPatientByCodeRequest,
    PackageRegistrationCreate,
    PatientLookupRequest,
    PatientProfileCreate,
    PatientRegistrationRequest,
    PatientVerificationRequest,
)
from app.services.patient_service import PatientService
from app.core.security import get_password_hash


def make_patient(db_session, account_id: str, patient_id: str, username: str) -> Account:
    account = Account(
        id=account_id,
        username=username,
        hashed_password=get_password_hash("Patient@123"),
        full_name="Nguyễn Minh An",
        role="PATIENT",
        status="ACTIVE",
    )
    patient = Patient(
        id=patient_id,
        account_id=account_id,
        full_name=account.full_name,
        date_of_birth=date(1994, 8, 20),
        gender="MALE",
        marital_status="MARRIED",
        phone_number="0900000001",
    )
    db_session.add_all([account, patient])
    db_session.commit()
    return account


def make_package(db_session) -> Package:
    tier = PackageTier(id="tier-test", code="TIER-TEST", name="Tiêu chuẩn", tier_order=1)
    package = Package(
        id="pkg-test", code="PKG-TEST", name="Gói khám kiểm thử", package_type="INDIVIDUAL",
        target_group="Mọi đối tượng", base_price=Decimal("1000000"), package_tier_id=tier.id,
    )
    service = db_session.query(ExamService).filter(ExamService.id == "es-kham-noi").one()
    db_session.add_all([tier, package])
    db_session.flush()
    db_session.add(PackageServiceItem(package_id=package.id, exam_service_id=service.id, is_mandatory=True))
    db_session.commit()
    return package


def test_patient_registration_requires_demo_verification(db_session):
    service = PatientService(db_session)
    result = service.register(PatientRegistrationRequest(
        username="new-patient",
        password="Patient@123",
        full_name="Nguyễn Minh An",
        date_of_birth=date(1994, 8, 20),
        gender="MALE",
        marital_status="MARRIED",
        phone_number="0900000001",
    ))

    pending = db_session.query(Account).filter(Account.id == result["account_id"]).one()
    assert pending.status == "PENDING"
    with pytest.raises(AppException) as invalid_code:
        service.verify_registration(PatientVerificationRequest(username="new-patient", code="000000"))
    assert invalid_code.value.code == "INVALID_VERIFICATION_CODE"

    token = service.verify_registration(PatientVerificationRequest(
        username="new-patient", code=result["demo_verification_code"]
    ))
    assert token.role == "PATIENT"
    assert db_session.query(Account).filter(Account.id == result["account_id"]).one().status == "ACTIVE"


def test_package_registration_approval_and_demo_payment(db_session):
    patient = make_patient(db_session, "patient-account-test", "patient-profile-test", "patient-test")
    package = make_package(db_session)
    coordinator = Account(
        id="coordinator-test", username="coordinator-test", hashed_password=get_password_hash("Coord@123"),
        full_name="Điều phối viên demo", role="COORDINATOR", status="ACTIVE",
    )
    db_session.add(coordinator)
    db_session.commit()

    service = PatientService(db_session)
    registration = service.create_package_registration(patient.id, PackageRegistrationCreate(package_id=package.id))
    assert registration.status == "PENDING_APPROVAL"
    with pytest.raises(AppException) as before_approval:
        service.complete_demo_payment(patient.id, registration.id)
    assert before_approval.value.code == "INVALID_REGISTRATION_STATUS"

    approved = service.approve_package_registration(registration.id, coordinator.id)
    assert approved.status == "APPROVED"
    paid = service.complete_demo_payment(patient.id, registration.id)
    assert paid.status == "PAID"
    assert paid.payment_method == "DEMO"
    assert db_session.query(SystemLog).filter(SystemLog.target_id == registration.id).count() == 3


def test_patient_checkin_is_owner_scoped_and_idempotent(db_session):
    patient = make_patient(db_session, "patient-account-checkin", "patient-profile-checkin", "patient-checkin")
    make_package(db_session)
    coordinator = Account(
        id="coordinator-checkin", username="coordinator-checkin", hashed_password=get_password_hash("Coord@123"),
        full_name="Điều phối viên demo", role="COORDINATOR", status="ACTIVE",
    )
    db_session.add(coordinator)
    db_session.flush()
    package_registration = PatientService(db_session).create_package_registration(
        patient.id, PackageRegistrationCreate(package_id="pkg-test")
    )
    PatientService(db_session).approve_package_registration(package_registration.id, coordinator.id)
    PatientService(db_session).complete_demo_payment(patient.id, package_registration.id)
    # Chọn ngày trong tuần lúc 08:00 sáng (thuộc khung giờ sáng 06:30 - 11:00)
    target_dt = datetime.now(timezone.utc) + timedelta(days=1)
    while target_dt.weekday() >= 5:  # Tránh Thứ Bảy và Chủ Nhật
        target_dt += timedelta(days=1)
    target_time = target_dt.replace(hour=1, minute=0, second=0, microsecond=0) # 01:00 UTC = 08:00 Vietnam time

    appointment = PatientService(db_session).create_appointment(patient.id, AppointmentCreateRequest(
        package_registration_id=package_registration.id,
        appointment_time=target_time,
    ))

    # Cập nhật thời gian hẹn trùng ngày hiện tại để kiểm thử luồng check-in
    from app.services.patient_service import get_utc_now
    stored_appt = db_session.query(Appointment).filter(Appointment.id == appointment.id).one()
    stored_appt.appointment_time = get_utc_now()
    db_session.commit()

    first_visit = PatientService(db_session).check_in(patient.id, appointment.appointment_code)
    second_visit = PatientService(db_session).check_in(patient.id, appointment.qr_payload)
    stored_appointment = db_session.query(Appointment).filter(Appointment.id == appointment.id).one()

    assert first_visit.id == second_visit.id
    assert first_visit.reception_channel == "APP"
    assert stored_appointment.status == "CHECKED_IN"
    assert db_session.query(Patient).filter(Patient.id == patient.patient_profile.id).one().visits[0].id == first_visit.id

    other_patient = make_patient(db_session, "other-account-checkin", "other-profile-checkin", "other-checkin")
    with pytest.raises(ResourceNotFound):
        PatientService(db_session).check_in(other_patient.id, appointment.appointment_code)


def test_patient_multiple_profiles_and_linking(db_session):
    account = make_patient(db_session, "multi-acc-01", "multi-pat-01", "multi-patient")
    service = PatientService(db_session)

    # 1. Ban đầu có 1 profile
    profiles = service.list_profiles(account.id)
    assert len(profiles) == 1
    assert profiles[0].full_name == "Nguyễn Minh An"

    # 2. Thêm profile mới (ví dụ hồ sơ người thân)
    child = service.create_profile(account.id, PatientProfileCreate(
        full_name="Nguyễn Minh Khang",
        date_of_birth=date(2020, 5, 10),
        gender="MALE",
        phone_number="0900000001",
        address="TP. Hồ Chí Minh",
    ))
    assert child.full_name == "Nguyễn Minh Khang"

    profiles = service.list_profiles(account.id)
    assert len(profiles) == 2

    # 3. Tạo một bệnh nhân vãng lai đã khám trực tiếp trước đó
    old_patient = Patient(
        id="old-pat-99",
        patient_code="BN-OLD-9999",
        full_name="Trần Thị Mai",
        date_of_birth=date(1975, 2, 14),
        gender="FEMALE",
        phone_number="0988777666",
        id_card_number="079175001234",
    )
    db_session.add(old_patient)
    db_session.commit()

    # 4. Tra cứu hồ sơ cũ
    lookup_results = service.lookup_profiles(account.id, PatientLookupRequest(
        phone_number="0988777666",
        last_name="Trần",
        first_name="Thị Mai",
        gender="FEMALE",
    ))
    assert len(lookup_results) == 1
    assert lookup_results[0].patient_code == "BN-OLD-9999"

    # 5. Liên kết hồ sơ cũ bằng mã
    linked = service.link_by_code(account.id, LinkPatientByCodeRequest(patient_code="BN-OLD-9999"))
    assert linked.id == old_patient.id
    assert linked.account_id == account.id

    # Danh sách hiện có 3 profile
    assert len(service.list_profiles(account.id)) == 3

    # 6. Đặt lịch trực tiếp với gói khám và profile đã chọn (08:00 sáng ngày thường)
    pkg = make_package(db_session)
    valid_dt = datetime.now(timezone.utc) + timedelta(days=2)
    while valid_dt.weekday() >= 5:
        valid_dt += timedelta(days=1)
    valid_time = valid_dt.replace(hour=1, minute=0, second=0, microsecond=0) # 01:00 UTC = 08:00 Vietnam time

    apt = service.create_appointment(account.id, AppointmentCreateRequest(
        patient_id=linked.id,
        package_id=pkg.id,
        appointment_time=valid_time,
        notes="Khám sức khỏe định kỳ",
    ))
    assert apt.patient_id == linked.id
    assert apt.package_id == pkg.id
    assert apt.status == "CONFIRMED"
