from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.exceptions import AppException, app_exception_handler
from app.core.websocket import ws_manager
from app.api.v1.api import api_router
from app.core.security import decode_access_token
from app.core.database import SessionLocal
import app.models  # Đảm bảo toàn bộ models được nạp vào Base.metadata
from app.models.account import Account
from app.models.customer import Patient
from app.models.visit import Visit

# Tự động tạo bảng nếu đang chạy thử nghiệm
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    description="Hệ thống điều phối khám chữa bệnh thông minh (Smart OPD Orchestration Platform)",
    version="1.0.0"
)

# Cấu hình CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Đăng ký Exception Handler toàn cục
app.add_exception_handler(AppException, app_exception_handler)

# Đăng ký Router API v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Kênh WebSocket thời gian thực thông báo trạng thái hàng đợi và lộ trình."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Nhận ping/heartbeat từ client
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


@app.websocket("/ws/patient")
async def patient_websocket_endpoint(websocket: WebSocket):
    """Kênh realtime của bệnh nhân; chỉ nhận queue tổng hợp và lượt khám sở hữu."""
    token = websocket.query_params.get("token")
    visit_id = websocket.query_params.get("visit_id")
    payload = decode_access_token(token) if token else None
    if not payload or payload.get("role") != "PATIENT" or not visit_id:
        await websocket.close(code=4401)
        return

    db = SessionLocal()
    try:
        account = db.query(Account).filter(
            Account.id == payload.get("sub"), Account.role == "PATIENT", Account.status == "ACTIVE"
        ).first()
        owns_visit = db.query(Visit.id).join(Patient, Patient.id == Visit.patient_id).filter(
            Visit.id == visit_id, Patient.account_id == payload.get("sub")
        ).first()
        if not account or not owns_visit:
            await websocket.close(code=4403)
            return
    finally:
        db.close()

    await ws_manager.connect_patient(websocket, payload["sub"], visit_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception:
        ws_manager.disconnect(websocket)


@app.get("/")
def root():
    return {
        "message": "Chào mừng đến với Smart OPD Orchestration Platform API",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
