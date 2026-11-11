import os
from datetime import datetime, timezone
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Hỗ trợ tự động fallback SQLite nếu chưa có PostgreSQL đang chạy cục bộ
db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

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


def get_db() -> Generator[Session, None, None]:
    """Dependency cung cấp Session CSDL và tự động đóng sau khi kết thúc request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
