import time
import httpx
from typing import Dict, Any, List
from app.core.config import settings


class AIClient:
    """Client giao tiếp với AI Service (ai-service/).
    
    Tuân thủ quy tắc:
    - Timeout: AI_INFERENCE_TIMEOUT_MS (500ms)
    - Tự động dùng phương án dự phòng khi quá hạn hoặc lỗi
    - Gắn nhãn nguồn rõ ràng (AI_RL hoặc HEURISTIC_FALLBACK)
    - Không trả lỗi 500 cho người dùng
    """
    def __init__(self):
        self.base_url = settings.AI_SERVICE_URL
        self.timeout_seconds = settings.AI_INFERENCE_TIMEOUT_MS / 1000.0

    async def infer_next_step_or_route(
        self,
        patient_state: Dict[str, Any],
        valid_activities: List[Dict[str, Any]],
        queue_metrics: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Gọi AI Service để dự đoán bước tiếp theo hoặc sinh lộ trình."""
        start_time = time.time()
        payload = {
            "patient_state": patient_state,
            "valid_activities": valid_activities,
            "queue_metrics": queue_metrics
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(f"{self.base_url}/v1/routes/recalculate", json=payload)
                if response.status_code == 200:
                    data = response.json()
                    latency_ms = int((time.time() - start_time) * 1000)
                    data["latency_ms"] = latency_ms
                    return data
        except Exception:
            # Fallback ngầm định khi AI timeout hoặc không kết nối được
            pass

        # === PHƯƠNG ÁN DỰ PHÒNG (HEURISTIC FALLBACK) ===
        # Chọn các hoạt động hợp lệ theo thứ tự thời gian chờ ngắn nhất
        latency_ms = int((time.time() - start_time) * 1000)
        
        sorted_activities = sorted(
            valid_activities,
            key=lambda x: queue_metrics.get(x.get("service_point_id", ""), {}).get("estimated_wait_seconds", 0)
        )
        
        fallback_steps = []
        accumulated_time = 0
        for idx, act in enumerate(sorted_activities):
            sp_id = act.get("service_point_id", "")
            sp_metric = queue_metrics.get(sp_id, {})
            wait_sec = sp_metric.get("estimated_wait_seconds", 300)
            serv_sec = sp_metric.get("avg_service_duration_seconds", 600)
            accumulated_time += (wait_sec + serv_sec)
            fallback_steps.append({
                "service_id": act.get("service_id"),
                "step_order": idx + 1,
                "estimated_wait_seconds": wait_sec,
                "estimated_service_seconds": serv_sec
            })

        return {
            "suggestion_source": "HEURISTIC_FALLBACK",
            "method_label": "Dự phòng (Heuristic)",
            "confidence": 0.75,
            "latency_ms": latency_ms,
            "estimated_total_duration_seconds": accumulated_time,
            "steps": fallback_steps,
            "is_fallback": True
        }


ai_client = AIClient()
