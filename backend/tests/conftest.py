import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base, get_db
from app.models import *
from app.core.security import get_password_hash

# SQLite In-Memory Database cho Unit Tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Tạo mới schema cho mỗi test case và rollback sạch sẽ."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Tạo sẵn tài khoản mẫu Admin và Doctor
    admin = Account(
        id="acc-admin-01",
        username="admin",
        hashed_password=get_password_hash("Admin@123"),
        full_name="Quản Trị Viên",
        role="ADMIN",
        status="ACTIVE"
    )
    doctor = Account(
        id="acc-doctor-01",
        username="doctor",
        hashed_password=get_password_hash("Doctor@123"),
        full_name="Bác Sĩ Nguyễn Văn A",
        role="DOCTOR",
        status="ACTIVE"
    )
    db.add(admin)
    db.add(doctor)
    
    # Tạo điểm dịch vụ mẫu
    sp_reception = ServicePoint(
        id="sp-reception",
        code="SP-REC",
        name="Quầy Tiếp Nhận",
        resource_count=2,
        avg_service_duration_seconds=300,
        queue_capacity=50
    )
    sp_internal = ServicePoint(
        id="sp-internal",
        code="SP-INT",
        name="Phòng Khám Nội",
        room_number="Phòng 101",
        resource_count=1,
        avg_service_duration_seconds=600,
        queue_capacity=20
    )
    db.add(sp_reception)
    db.add(sp_internal)
    
    # Dịch vụ khám mẫu
    es1 = ExamService(
        id="es-kham-noi",
        code="DV-NOI",
        name="Khám Nội Tổng Quát",
        category="Lâm sàng",
        default_service_point_id="sp-internal"
    )
    db.add(es1)
    
    # Bệnh nhân mẫu
    from datetime import date
    patient = Patient(
        id="pat-01",
        full_name="Trần Thị B",
        date_of_birth=date(1990, 5, 15),
        gender="FEMALE",
        phone_number="0987654321"
    )
    db.add(patient)
    
    db.commit()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
