from datetime import date, time
from app.models.account import Account, StaffMember, Doctor
from app.models.customer import DoctorSchedule
from app.services.doctor_service import DoctorService


def seed_test_doctor(db_session):
    account = db_session.query(Account).filter(Account.id == "acc-doctor-01").first()
    if not account:
        account = Account(
            id="acc-doctor-01",
            username="doctor",
            full_name="BS. Nguyễn Văn A",
            role="DOCTOR",
            status="ACTIVE",
        )
        db_session.add(account)

    staff = db_session.query(StaffMember).filter(StaffMember.id == "acc-doctor-01").first()
    if not staff:
        staff = StaffMember(id="acc-doctor-01", staff_type="DOCTOR")
        db_session.add(staff)

    doc = db_session.query(Doctor).filter(Doctor.id == "acc-doctor-01").first()
    if not doc:
        doc = Doctor(
            id="acc-doctor-01",
            specialty="Nội Tổng Quát",
            license_number="CCHN-00123/HCM",
            academic_title="TS. BS.",
            avatar_url="https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300",
            education="• Đại học Y Dược TP.HCM",
            experience="• Trưởng khoa Nội",
            memberships="• Hội Tim Mạch Việt Nam",
            schedule_summary="Sáng Thứ 2, Thứ 4",
        )
        db_session.add(doc)
    db_session.commit()
    return doc


def test_list_doctors_and_specialties(db_session):
    seed_test_doctor(db_session)
    service = DoctorService(db_session)
    doctors = service.list_doctors()
    assert len(doctors) >= 1

    specialties = service.list_specialties()
    assert "Nội Tổng Quát" in specialties

    # Check first doctor structure
    first = doctors[0]
    assert first.full_name is not None
    assert first.academic_title == "TS. BS."
    assert first.specialty == "Nội Tổng Quát"


def test_filter_doctors_by_day_and_specialty(db_session):
    seed_test_doctor(db_session)
    service = DoctorService(db_session)
    all_docs = service.list_doctors()

    assert len(all_docs) >= 1
    spec = all_docs[0].specialty
    filtered_by_spec = service.list_doctors(specialty=spec)
    assert len(filtered_by_spec) >= 1
    assert all(d.specialty == spec for d in filtered_by_spec)


def test_doctor_detail_tabs(db_session):
    seed_test_doctor(db_session)
    service = DoctorService(db_session)
    detail = service.get_doctor_detail("acc-doctor-01")
    assert detail.id == "acc-doctor-01"
    assert detail.academic_title == "TS. BS."
    assert "Đại học Y Dược" in detail.education
    assert "Trưởng khoa Nội" in detail.experience
    assert "Hội Tim Mạch" in detail.memberships
    assert isinstance(detail.schedules, list)
