from fastapi import FastAPI, status
from app.core.config import settings
from app.schemas.route import RecalculateRouteRequest, RecalculateRouteResponse
from app.services.routing_engine import engine

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Dịch vụ suy luận lộ trình thông minh cho Hệ thống điều phối khám chữa bệnh",
    version=settings.MODEL_VERSION
)


@app.get("/health", status_code=status.HTTP_200_OK, summary="Kiểm tra trạng thái nạp mô hình AI")
def health():
    return {
        "status": "HEALTHY",
        "model_version": settings.MODEL_VERSION,
        "is_model_loaded": True
    }


@app.post("/v1/routes/recalculate", response_model=RecalculateRouteResponse, summary="Suy luận lộ trình tối ưu")
def recalculate_route(req: RecalculateRouteRequest):
    """Suy luận lộ trình tối ưu từ trạng thái bệnh nhân, danh sách hoạt động hợp lệ và chỉ số hàng đợi."""
    return engine.infer_optimal_route(
        patient_state=req.patient_state,
        valid_activities=req.valid_activities,
        queue_metrics=req.queue_metrics
    )
