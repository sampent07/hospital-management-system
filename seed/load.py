import json
import os
import sys
from datetime import datetime, date

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
        if not acc:
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
        if not pat:
            dob_str = pat_data.pop("date_of_birth")
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
            pat = Patient(date_of_birth=dob, **pat_data)
            db.add(pat)
    db.commit()

    db.close()
    print("=== NẠP DỮ LIỆU MẪU HOÀN TẤT THÀNH CÔNG ===")


if __name__ == "__main__":
    load_seed_data()
