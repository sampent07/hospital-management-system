import pytest
from datetime import datetime, date
from app.services.patient_service import PatientService
from app.services.clinical_service import ClinicalService
from app.services.appointment_service import AppointmentService
from app.services.authorization_service import AuthorizationService
from app.services.visit_service import VisitService
from app.schemas.patient import PatientCreate, PatientUpdate, MedicalRecordCreate
from app.schemas.clinical import (
    ExamResultCreate,
    DiagnosisCreate,
    PrescriptionCreate,
    PrescriptionItemCreate,
    TreatmentPlanCreate,
    ConclusionCreate,
)
from app.schemas.appointment import AppointmentCreate
from app.schemas.authorization import AuthorizationCreate
from app.schemas.visit import VisitCreateRequest
from app.models.visit import VisitProgress


def test_patient_management(db_session):
    """STAFF-04 & STAFF-05: Tiếp nhận, tìm kiếm và cập nhật hồ sơ bệnh nhân."""
    service = PatientService(db_session)

    # 1. Tạo bệnh nhân mới
    req = PatientCreate(
        full_name="Nguyễn Văn Test",
        date_of_birth=date(1995, 8, 20),
        gender="MALE",
        phone_number="0911223344",
        email="test@example.com",
        address="123 Đường Y Tế",
        id_card_number="079195000123"
    )
    pat = service.create_patient(req)
    assert pat.id is not None
    assert pat.full_name == "Nguyễn Văn Test"

    # 2. Tìm kiếm bệnh nhân theo SĐT hoặc CCCD
    found = service.search_patients("0911223344")
    assert len(found) >= 1
    assert found[0].id == pat.id

    # 3. Cập nhật thông tin hành chính
    update_req = PatientUpdate(address="456 Đường Mới", marital_status="MARRIED")
    updated = service.update_patient(pat.id, update_req)
    assert updated.address == "456 Đường Mới"
    assert updated.marital_status == "MARRIED"

    # 4. Ghi nhận tiền sử bệnh án
    med_req = MedicalRecordCreate(
        medical_history="Viêm dạ dày mạn tính",
        family_history="Bố có tiền sử tăng huyết áp",
        allergies="Dị ứng Penicillin"
    )
    rec = service.add_medical_record(pat.id, med_req)
    assert rec.id is not None
    assert rec.allergies == "Dị ứng Penicillin"


def test_clinical_examination_and_treatment(db_session):
    """STAFF-09, STAFF-10, STAFF-11: Chẩn đoán, kê đơn, kết luận và in phiếu khám."""
    patient_svc = PatientService(db_session)
    visit_svc = VisitService(db_session)
    clinical_svc = ClinicalService(db_session)

    # 1. Tạo lượt khám mẫu
    pat = patient_svc.create_patient(
        PatientCreate(
            full_name="Bệnh Nhân Lâm Sàng",
            date_of_birth=date(1988, 3, 10),
            gender="FEMALE",
            phone_number="0909090909"
        )
    )
    visit = visit_svc.create_visit(
        VisitCreateRequest(patient_id=pat.id, visit_type="SYMPTOM_ORDER"),
        creator_id="acc-admin-01"
    )

    # Tạo 1 tiến độ dịch vụ xét nghiệm máu
    progress = VisitProgress(
        visit_id=visit.id,
        exam_service_id="es-kham-noi",
        service_point_id="sp-internal",
        status="COMPLETED",
        version=1
    )
    db_session.add(progress)
    db_session.commit()
    db_session.refresh(progress)

    # 2. Ghi nhận kết quả cận lâm sàng (STAFF-09)
    result_req = ExamResultCreate(
        visit_progress_id=progress.id,
        result_content="Hồng cầu bình thường, bạch cầu hơi tăng nhẹ."
    )
    exam_res = clinical_svc.record_exam_result(result_req, actor_id="acc-doctor-01")
    assert exam_res.id is not None
    assert "bạch cầu" in exam_res.result_content

    # 3. Chẩn đoán bệnh (STAFF-09)
    diag_req = DiagnosisCreate(
        visit_id=visit.id,
        icd10_code="J00",
        diagnosis_description="Viêm mũi họng cấp (Cảm lạnh)"
    )
    diag = clinical_svc.record_diagnosis(diag_req, doctor_account_id="acc-doctor-01")
    assert diag.id is not None
    assert diag.icd10_code == "J00"

    # 4. Kê đơn thuốc (STAFF-10)
    presc_req = PrescriptionCreate(
        visit_id=visit.id,
        doctor_advice="Uống nhiều nước ấm, nghỉ ngơi hợp lý.",
        items=[
            PrescriptionItemCreate(
                drug_name="Paracetamol 500mg",
                dosage="500mg",
                unit="viên",
                quantity=10,
                usage_instructions="Uống 1 viên khi sốt trên 38.5 độ C"
            ),
            PrescriptionItemCreate(
                drug_name="Vitamin C 1000mg",
                dosage="1000mg",
                unit="viên sủi",
                quantity=10,
                usage_instructions="Hòa tan 1 viên vào 200ml nước mỗi sáng"
            )
        ]
    )
    presc = clinical_svc.create_prescription(presc_req, doctor_account_id="acc-doctor-01")
    assert presc.id is not None
    assert len(presc.items) == 2

    # 5. Lập kế hoạch điều trị (STAFF-10)
    plan_req = TreatmentPlanCreate(
        visit_id=visit.id,
        plan_content="Điều trị triệu chứng trong 5 ngày, tái khám nếu còn sốt cao.",
        estimated_duration_days=5
    )
    plan = clinical_svc.create_treatment_plan(plan_req, doctor_account_id="acc-doctor-01")
    assert plan.id is not None
    assert plan.estimated_duration_days == 5

    # 6. Lập kết luận khám (STAFF-11)
    concl_req = ConclusionCreate(
        visit_id=visit.id,
        conclusion_text="Bệnh nhân đáp ứng tốt, theo dõi tại nhà.",
        doctor_recommendation="Giữ ấm cơ thể, ăn uống đầy đủ dinh dưỡng."
    )
    concl = clinical_svc.create_conclusion(concl_req, doctor_account_id="acc-doctor-01")
    assert concl.id is not None
    assert visit.status == "COMPLETED"

    # 7. Tóm tắt toàn bộ hồ sơ lượt khám để in phiếu khám
    summary = clinical_svc.get_visit_summary(visit.id)
    assert summary.patient_name == "Bệnh Nhân Lâm Sàng"
    assert len(summary.diagnoses) == 1
    assert len(summary.prescriptions) == 1
    assert summary.conclusion is not None


def test_appointment_and_followup(db_session):
    """STAFF-13: Quản lý lịch hẹn & Đặt lịch tái khám."""
    patient_svc = PatientService(db_session)
    appt_svc = AppointmentService(db_session)

    pat = patient_svc.create_patient(
        PatientCreate(
            full_name="Người Hẹn Tái Khám",
            date_of_birth=date(1992, 1, 1),
            gender="MALE",
            phone_number="0933445566"
        )
    )

    now = datetime.now()
    appt_req = AppointmentCreate(
        patient_id=pat.id,
        appointment_time=now,
        appointment_type="FOLLOW_UP",
        notes="Tái khám kiểm tra họng sau 5 ngày"
    )
    appt = appt_svc.create_appointment(appt_req)
    assert appt.id is not None
    assert appt.status == "SCHEDULED"
    assert appt.appointment_type == "FOLLOW_UP"

    # Cập nhật trạng thái sang CONFIRMED
    updated = appt_svc.update_appointment_status(appt.id, "CONFIRMED")
    assert updated.status == "CONFIRMED"


def test_authorization_workflow(db_session):
    """STAFF-14 & STAFF-15: Bác sĩ ủy quyền cho Thư ký và Thư ký tiếp nhận ủy quyền."""
    from app.models.account import Account
    from app.core.security import get_password_hash

    # Tạo tài khoản Thư ký
    coord = Account(
        id="acc-coord-test",
        username="coordinator_test",
        hashed_password=get_password_hash("Coord@123"),
        full_name="Thư Ký Phạm Thị C",
        role="COORDINATOR",
        status="ACTIVE"
    )
    db_session.add(coord)
    db_session.commit()

    auth_svc = AuthorizationService(db_session)

    # 1. Bác sĩ tạo ủy quyền
    auth_req = AuthorizationCreate(
        coordinator_id=coord.id,
        scope="Hỗ trợ tiếp nhận bệnh nhân & Quyết định lộ trình khám hộ"
    )
    auth = auth_svc.create_authorization(doctor_account_id="acc-doctor-01", req=auth_req)
    assert auth.id is not None
    assert auth.status == "PENDING"
    assert auth.coordinator_name == "Thư Ký Phạm Thị C"

    # 2. Thư ký tiếp nhận ủy quyền
    accepted = auth_svc.accept_authorization(auth.id, coordinator_account_id=coord.id)
    assert accepted.status == "ACTIVE"
    assert accepted.accepted_at is not None

    # 3. Bác sĩ thu hồi ủy quyền
    revoked = auth_svc.revoke_authorization(auth.id, doctor_account_id="acc-doctor-01")
    assert revoked.status == "REVOKED"
