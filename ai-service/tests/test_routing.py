from app.services.routing_engine import engine
from app.schemas.route import ActivityItem


def test_routing_engine_valid_activities():
    patient_state = {"is_priority": False}
    valid_activities = [
        ActivityItem(service_id="service-xray", service_point_id="sp-xray"),
        ActivityItem(service_id="service-blood", service_point_id="sp-blood"),
    ]
    queue_metrics = {
        "sp-xray": {"estimated_wait_seconds": 1200, "avg_service_duration_seconds": 300},
        "sp-blood": {"estimated_wait_seconds": 300, "avg_service_duration_seconds": 180},
    }

    res = engine.infer_optimal_route(patient_state, valid_activities, queue_metrics)
    assert res.suggestion_source == "AI_RL"
    assert len(res.steps) == 2
    # Xét nghiệm máu có thời gian chờ ngắn hơn (300s so với 1200s), nên phải xếp bước 1
    assert res.steps[0].service_id == "service-blood"
    assert res.steps[1].service_id == "service-xray"


def test_routing_engine_empty_activities():
    res = engine.infer_optimal_route({}, [], {})
    assert len(res.steps) == 0
    assert res.estimated_total_duration_seconds == 0
