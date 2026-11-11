from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.core.exceptions import AppException, app_exception_handler
from app.core.websocket import ws_manager
from app.api.v1.api import api_router

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


@app.get("/")
def root():
    return {
        "message": "Chào mừng đến với Smart OPD Orchestration Platform API",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
