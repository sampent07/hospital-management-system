import pytest
from app.services.visit_service import VisitService
from app.schemas.visit import VisitCreateRequest, StatusTransitionRequest
from app.core.exceptions import InvalidStatusTransition, ConcurrentUpdateError


@pytest.mark.asyncio
async def test_valid_status_transition_lifecycle(db_session):
    """Test vòng đời chuyển trạng thái hợp lệ: NOT_STARTED -> WAITING -> IN_PROGRESS -> COMPLETED."""
    service = VisitService(db_session)
    
    # 1. Tạo lượt khám
    req = VisitCreateRequest(
        patient_id="pat-01",
        visit_type="SYMPTOM_ORDER"
    )
    visit = service.create_visit(req, creator_id="acc-admin-01")
    assert visit.id is not None
    assert visit.queue_number == 1

    # Tạo một tiến độ dịch vụ thủ công để test
    from app.models.visit import VisitProgress
    progress = VisitProgress(
        visit_id=visit.id,
        exam_service_id="es-kham-noi",
        service_point_id="sp-internal",
        status="NOT_STARTED",
        version=1
    )
    db_session.add(progress)
    db_session.commit()
    db_session.refresh(progress)

    # 2. Chuyển NOT_STARTED -> WAITING (Hợp lệ)
    trans1 = StatusTransitionRequest(
        new_status="WAITING",
        expected_version=1
    )
    res1 = await service.update_progress_status(progress.id, trans1, actor_id="acc-admin-01")
    assert res1.status == "WAITING"
    assert res1.version == 2
    assert res1.queued_at is not None

    # 3. Chuyển WAITING -> IN_PROGRESS (Hợp lệ)
    trans2 = StatusTransitionRequest(
        new_status="IN_PROGRESS",
        expected_version=2
    )
    res2 = await service.update_progress_status(progress.id, trans2, actor_id="acc-doctor-01")
    assert res2.status == "IN_PROGRESS"
    assert res2.version == 3
    assert res2.started_at is not None

    # 4. Chuyển IN_PROGRESS -> COMPLETED (Hợp lệ)
    trans3 = StatusTransitionRequest(
        new_status="COMPLETED",
        expected_version=3
    )
    res3 = await service.update_progress_status(progress.id, trans3, actor_id="acc-doctor-01")
    assert res3.status == "COMPLETED"
    assert res3.version == 4
    assert res3.completed_at is not None


@pytest.mark.asyncio
async def test_cannot_skip_status_directly_to_completed(db_session):
    """Bắt buộc ném InvalidStatusTransition nếu nhảy cóc từ NOT_STARTED sang COMPLETED."""
    service = VisitService(db_session)
    from app.models.visit import VisitProgress
    
    progress = VisitProgress(
        visit_id="dummy-visit",
        exam_service_id="es-kham-noi",
        service_point_id="sp-internal",
        status="NOT_STARTED",
        version=1
    )
    db_session.add(progress)
    db_session.commit()

    trans = StatusTransitionRequest(
        new_status="COMPLETED",
        expected_version=1
    )

    with pytest.raises(InvalidStatusTransition) as exc_info:
        await service.update_progress_status(progress.id, trans, actor_id="acc-doctor-01")
    
    assert "Không thể chuyển trạng thái từ 'NOT_STARTED' sang 'COMPLETED'" in str(exc_info.value)


@pytest.mark.asyncio
async def test_optimistic_locking_prevents_race_condition(db_session):
    """Bắt buộc ném ConcurrentUpdateError nếu gửi sai expected_version (có người khác sửa trước)."""
    service = VisitService(db_session)
    from app.models.visit import VisitProgress
    
    progress = VisitProgress(
        visit_id="dummy-visit",
        exam_service_id="es-kham-noi",
        service_point_id="sp-internal",
        status="NOT_STARTED",
        version=1
    )
    db_session.add(progress)
    db_session.commit()

    # User A gửi expected_version=99 thay vì 1
    trans = StatusTransitionRequest(
        new_status="WAITING",
        expected_version=99
    )

    with pytest.raises(ConcurrentUpdateError) as exc_info:
        await service.update_progress_status(progress.id, trans, actor_id="acc-doctor-01")
    
    assert "Dữ liệu đã thay đổi" in str(exc_info.value)
