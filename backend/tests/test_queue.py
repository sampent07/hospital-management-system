from app.services.queue_service import QueueService


def test_queue_wait_time_formula():
    """Kiểm tra công thức thời gian chờ: (waiting * avg_duration) / max(1, resources)."""
    # 6 người chờ, mỗi người 600s, 2 bàn khám -> (6 * 600) / 2 = 1800s (30 phút)
    wait_time = QueueService.calculate_estimated_wait_seconds(
        waiting_count=6,
        avg_duration_seconds=600,
        resource_count=2
    )
    assert wait_time == 1800

    # 0 người chờ -> 0s
    assert QueueService.calculate_estimated_wait_seconds(0, 600, 2) == 0

    # 1 người chờ, 1 bàn khám -> 600s
    assert QueueService.calculate_estimated_wait_seconds(1, 600, 1) == 600
