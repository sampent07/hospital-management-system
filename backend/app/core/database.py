import os
from datetime import datetime, timezone, timedelta
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Hỗ trợ tự động fallback SQLite nếu chưa có PostgreSQL đang chạy cục bộ
db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    # Chuẩn hóa đường dẫn tuyệt đối cho SQLite để tránh bị lệch file DB theo thư mục chạy lệnh
    if ":///" in db_url and not os.path.isabs(db_url.split(":///", 1)[1]):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        db_filename = os.path.basename(db_url.split(":///", 1)[1]) or "hospital.db"
        abs_db_path = os.path.join(backend_dir, db_filename)
        db_url = f"sqlite:///{abs_db_path}"

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_utc_now() -> datetime:
    """Trả về thời điểm hiện tại ở chuẩn UTC có thông tin múi giờ (timezone-aware)."""
    return datetime.now(timezone.utc)


def get_facility_tz() -> timezone:
    """Trả về múi giờ cơ sở (mặc định Asia/Ho_Chi_Minh, UTC+7), an toàn trên Windows/Linux."""
    try:
        from zoneinfo import ZoneInfo
        return ZoneInfo(settings.FACILITY_TIMEZONE)
    except Exception:
        return timezone(timedelta(hours=7))


def get_db() -> Generator[Session, None, None]:
    """Dependency cung cấp Session CSDL và tự động đóng sau khi kết thúc request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
