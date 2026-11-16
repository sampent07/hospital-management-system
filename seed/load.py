import json
import os
import sys
from datetime import datetime, timedelta

# Thêm đường dẫn backend vào sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, Base, engine, get_utc_now
from app.core.security import get_password_hash
from app.models import (
    Account,
    StaffMember,
    Doctor,
    ServicePoint,
    ExamService,
    PackageTier,
    Package,
    PackageServiceItem,
    Patient,
    PatientPackageRegistration,
    Appointment,
    Visit,
    VisitProgress,
    Route,
    RouteStep,
    Constraint,
)


def load_seed_data():
    print("=== ĐANG NẠP DỮ LIỆU MẪU (SEED DATA) ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    seed_file = os.path.join(os.path.dirname(__file__), "seed_data.json")
    with open(seed_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Điểm dịch vụ
    print("-> Nạp điểm dịch vụ...")
    for sp_data in data["service_points"]:
        sp = db.query(ServicePoint).filter(ServicePoint.id == sp_data["id"]).first()
        if not sp:
            sp = ServicePoint(**sp_data)
            db.add(sp)
    db.commit()

    # 2. Dịch vụ khám
    print("-> Nạp danh mục dịch vụ khám...")
    for es_data in data["exam_services"]:
        es = db.query(ExamService).filter(ExamService.id == es_data["id"]).first()
        if not es:
            es = ExamService(**es_data)
            db.add(es)
    db.commit()

    # 3. Cấp độ gói
    print("-> Nạp cấp độ gói...")
    for tier_data in data["package_tiers"]:
        tier = db.query(PackageTier).filter(PackageTier.id == tier_data["id"]).first()
        if not tier:
            tier = PackageTier(**tier_data)
            db.add(tier)
    db.commit()

    # 4. Gói khám và bảng nối dịch vụ
    print("-> Nạp gói khám...")
    for pkg_data in data["packages"]:
        pkg = db.query(Package).filter(Package.id == pkg_data["id"]).first()
        if not pkg:
            services = pkg_data.pop("services", [])
            pkg = Package(**pkg_data)
            db.add(pkg)
            db.flush()
            for s_id in services:
                psi = PackageServiceItem(
                    package_id=pkg.id,
                    exam_service_id=s_id,
                    is_mandatory=True
                )
                db.add(psi)
    db.commit()

    # 5. Tài khoản
    print("-> Nạp tài khoản và nhân viên...")
    for acc_data in data["accounts"]:
        acc = db.query(Account).filter(Account.id == acc_data["id"]).first()
        if acc:
            # Giữ mật khẩu/tài khoản đã chạy nhưng đồng bộ tên hiển thị của fixture.
            acc.full_name = acc_data["full_name"]
        else:
            raw_password = acc_data.pop("password")
            specialty = acc_data.pop("specialty", None)
            license_number = acc_data.pop("license_number", None)

            acc = Account(
                hashed_password=get_password_hash(raw_password),
                **acc_data
            )
            db.add(acc)
            db.flush()

            if acc.role in ["DOCTOR", "COORDINATOR", "ADMIN"]:
                staff = StaffMember(
                    id=acc.id,
                    staff_type=acc.role
                )
                db.add(staff)
                db.flush()

                if acc.role == "DOCTOR":
                    doc = Doctor(
                        id=acc.id,
                        specialty=specialty or "Đa khoa",
                        license_number=license_number or "CCHN-001"
                    )
                    db.add(doc)
    db.commit()

    # 6. Bệnh nhân mẫu
    print("-> Nạp thông tin bệnh nhân...")
    for pat_data in data["patients"]:
        pat = db.query(Patient).filter(Patient.id == pat_data["id"]).first()
        dob_str = pat_data.pop("date_of_birth")
        dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        if pat:
            for field, value in pat_data.items():
                setattr(pat, field, value)
            pat.date_of_birth = dob
        else:
            pat = Patient(date_of_birth=dob, **pat_data)
            db.add(pat)
    db.commit()

    # 7. Đăng ký gói cá nhân của bệnh nhân
    print("-> Nạp đăng ký gói bệnh nhân...")
    now = get_utc_now()
    for registration_data in data.get("patient_package_registrations", []):
        registration = db.query(PatientPackageRegistration).filter(
            PatientPackageRegistration.id == registration_data["id"]
        ).first()
        if registration:
            continue
        requested_at = now - timedelta(minutes=registration_data["minutes_ago"])
        paid_at = registration_data.get("paid_minutes_ago")
        registration = PatientPackageRegistration(
            id=registration_data["id"],
            patient_id=registration_data["patient_id"],
            package_id=registration_data["package_id"],
            price_snapshot=db.query(Package).filter(Package.id == registration_data["package_id"]).one().base_price,
            status=registration_data["status"],
            requested_at=requested_at,
            reviewed_by_id=registration_data.get("reviewed_by_id"),
            reviewed_at=(now - timedelta(minutes=registration_data.get("paid_minutes_ago", 0) + 5))
            if registration_data.get("reviewed_by_id") else None,
            paid_at=now - timedelta(minutes=paid_at) if paid_at is not None else None,
            payment_method=registration_data.get("payment_method"),
        )
        db.add(registration)
    db.commit()

    # 8. Lịch hẹn: mã nhập và nội dung QR dùng chung một giá trị
    print("-> Nạp lịch hẹn bệnh nhân...")
    now = get_utc_now()
    for appointment_data in data.get("appointments", []):
        appointment = db.query(Appointment).filter(Appointment.id == appointment_data["id"]).first()
        if appointment:
            continue
        appt_time_str = appointment_data.get("appointment_time")
        if appt_time_str:
            appt_time = datetime.fromisoformat(appt_time_str.replace("Z", "+00:00"))
        else:
            appt_time = now + timedelta(minutes=appointment_data.get("minutes_from_now", 60))

        appointment = Appointment(
            id=appointment_data["id"],
            patient_id=appointment_data["patient_id"],
            package_id=appointment_data.get("package_id"),
            package_registration_id=appointment_data.get("package_registration_id"),
            appointment_time=appt_time,
            appointment_type="PACKAGE",
            appointment_code=appointment_data["appointment_code"],
            doctor_id=appointment_data.get("doctor_id", "acc-03-doctor"),
            status=appointment_data["status"],
        )
        db.add(appointment)
    db.commit()

    # 9. Một lượt khám đã check-in để demo tiến độ và hàng đợi; các lịch hẹn khác vẫn dùng được để thử check-in.
    print("-> Nạp lượt khám và tiến độ bệnh nhân...")
    now = get_utc_now()
    for visit_data in data.get("visits", []):
        visit = db.query(Visit).filter(Visit.id == visit_data["id"]).first()
        if not visit:
            visit = Visit(
                id=visit_data["id"],
                visit_code=visit_data["visit_code"],
                patient_id=visit_data["patient_id"],
                appointment_id=visit_data.get("appointment_id"),
                package_id=visit_data.get("package_id"),
                visit_type=visit_data["visit_type"],
                reception_channel=visit_data["reception_channel"],
                is_priority=False,
                queue_number=visit_data["queue_number"],
                status=visit_data["status"],
                check_in_at=now - timedelta(minutes=visit_data["minutes_ago"]),
                created_by_id=visit_data.get("created_by_id"),
            )
            db.add(visit)
    db.commit()

    progress_statuses = {"WAITING", "IN_PROGRESS", "COMPLETED"}
    for progress_data in data.get("visit_progress", []):
        progress = db.query(VisitProgress).filter(VisitProgress.id == progress_data["id"]).first()
        if progress:
            continue
        changed_at = now - timedelta(minutes=progress_data["minutes_ago"])
        status = progress_data["status"]
        progress = VisitProgress(
            id=progress_data["id"],
            visit_id=progress_data["visit_id"],
            exam_service_id=progress_data["exam_service_id"],
            service_point_id=progress_data["service_point_id"],
            service_source="PACKAGE",
            status=status,
            assigned_at=changed_at,
            queued_at=changed_at if status in progress_statuses else None,
            started_at=changed_at if status in {"IN_PROGRESS", "COMPLETED"} else None,
            completed_at=changed_at if status == "COMPLETED" else None,
            performed_by_id=progress_data.get("performed_by_id"),
            version=2 if status != "NOT_STARTED" else 1,
        )
        db.add(progress)
    db.commit()

    # 10. Lộ trình hiện hành gồm đúng các dịch vụ chưa hoàn thành
    print("-> Nạp lộ trình hiện hành...")
    for route_data in data.get("routes", []):
        route = db.query(Route).filter(Route.id == route_data["id"]).first()
        if not route:
            route = Route(
                id=route_data["id"],
                visit_id=route_data["visit_id"],
                version=route_data["version"],
                creation_reason=route_data["creation_reason"],
                status=route_data["status"],
                suggestion_source=route_data["suggestion_source"],
                estimated_total_duration_seconds=route_data["estimated_total_duration_seconds"],
                created_at=now - timedelta(minutes=route_data["minutes_ago"]),
            )
            db.add(route)
    db.commit()

    for step_data in data.get("route_steps", []):
        step = db.query(RouteStep).filter(RouteStep.id == step_data["id"]).first()
        if not step:
            db.add(RouteStep(**step_data))
    db.commit()

    # 11. Nạp lịch khám bác sĩ (DoctorSchedule - LICHKHAM trong ERD)
    from app.models.customer import DoctorSchedule
    import calendar
    from datetime import date
    import uuid

    if db.query(DoctorSchedule).count() == 0:
        print("-> Nạp lịch khám bác sĩ (Sáng: 06:30 - 11:00, Chiều: 13:30 - 15:30)...")
        slots_weekday = [
            ("06:30", "07:30"), ("07:30", "08:30"), ("08:30", "09:30"),
            ("09:30", "10:30"), ("10:30", "11:00"), ("13:30", "14:30"), ("14:30", "15:30"),
        ]
        slots_saturday = [
            ("06:30", "07:30"), ("07:30", "08:30"), ("08:30", "09:30"),
            ("09:30", "10:30"), ("10:30", "11:00"),
        ]
        for year, month in [(2026, 11), (2026, 12)]:
            _, num_days = calendar.monthrange(year, month)
            for d in range(1, num_days + 1):
                cur_date = date(year, month, d)
                if cur_date.weekday() == 6:  # Chủ nhật nghỉ
                    continue
                slots = slots_saturday if cur_date.weekday() == 5 else slots_weekday
                is_full = (month == 11 and d in (18, 25))
                for start_t, end_t in slots:
                    db.add(DoctorSchedule(
                        id=str(uuid.uuid4()),
                        doctor_id="acc-03-doctor",
                        service_point_id="sp-02-internal",
                        package_id=None,
                        work_date=cur_date,
                        start_time=start_t,
                        end_time=end_t,
                        max_slots=10,
                        current_booked=10 if is_full else 0,
                        status="FULL" if is_full else "AVAILABLE",
                    ))
        db.commit()

    db.close()
    print("=== NẠP DỮ LIỆU MẪU HOÀN TẤT THÀNH CÔNG ===")


if __name__ == "__main__":
    load_seed_data()
