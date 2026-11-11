from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart OPD Orchestration Platform"
    API_V1_STR: str = "/api/v1"
    
    # Cấu hình Database (Hỗ trợ SQLite cho local dev và PostgreSQL qua psycopg2 khi chạy Docker)
    DATABASE_URL: str = "sqlite:///./hospital.db"
    
    # Bảo mật JWT
    SECRET_KEY: str = "smart-opd-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://localhost:5174",
        "*"
    ]
    
    # Dịch vụ AI Service
    AI_SERVICE_URL: str = "http://localhost:8001"
    
    # CẤU HÌNH NGHIỆP VỤ BẤT BIẾN (Theo DOMAIN_RULES.md)
    AI_INFERENCE_TIMEOUT_MS: int = 500  # Thời gian tối đa 1 lần suy luận AI
    ROUTE_COMPUTE_TIMEOUT_MS: int = 3000  # Thời gian tối đa tính toàn bộ lộ trình
    REALTIME_PROPAGATION_SECONDS: int = 2  # Mục tiêu cập nhật realtime tới UI
    ROUTE_MIN_IMPROVEMENT_MINUTES: int = 3  # Chỉ đề xuất lộ trình mới khi tiết kiệm >= 3 phút
    ROUTE_RECALC_COOLDOWN_SECONDS: int = 30  # Giãn cách giữa 2 lần tính lại
    WAIT_RETRY_SECONDS: int = 60  # Thử lại sau khi hàng đợi đầy
    STATUS_UNDO_WINDOW_SECONDS: int = 60  # Cửa sổ thời gian cho phép hoàn tác trạng thái
    OVERDUE_FACTOR: float = 1.5  # Hệ số cảnh báo quá hạn
    FACILITY_TIMEZONE: str = "Asia/Ho_Chi_Minh"  # Múi giờ cơ sở
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
