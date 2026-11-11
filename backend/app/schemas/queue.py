from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class QueuePatientItem(BaseModel):
    progress_id: str
    visit_id: str
    visit_code: str
    patient_name: str
    is_priority: bool
    queue_number: int
    queued_at: datetime
    status: str
    version: int


class ServicePointQueueSummary(BaseModel):
    service_point_id: str
    service_point_code: str
    service_point_name: str
    room_number: Optional[str] = None
    resource_count: int
    avg_service_duration_seconds: int
    queue_capacity: int
    waiting_count: int
    in_progress_count: int
    estimated_wait_seconds: int
    is_full: bool
    waiting_patients: List[QueuePatientItem] = []
    in_progress_patients: List[QueuePatientItem] = []
    recently_completed_patients: List[QueuePatientItem] = []
