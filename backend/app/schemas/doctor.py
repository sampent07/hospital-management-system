from typing import List, Optional
from datetime import date
from pydantic import BaseModel, ConfigDict


class DoctorScheduleSlotItem(BaseModel):
    id: str
    work_date: date
    start_time: str
    end_time: str
    max_slots: int
    current_booked: int
    remaining_slots: int
    status: str
    service_point_id: str
    room_number: Optional[str] = None
    room_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class DoctorListItem(BaseModel):
    id: str
    full_name: str
    academic_title: str
    specialty: str
    avatar_url: Optional[str] = None
    license_number: str
    schedule_summary: Optional[str] = None
    service_point_id: Optional[str] = None
    room_number: Optional[str] = None
    room_name: Optional[str] = None
    available_days: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class DoctorDetail(BaseModel):
    id: str
    full_name: str
    academic_title: str
    specialty: str
    avatar_url: Optional[str] = None
    license_number: str
    schedule_summary: Optional[str] = None
    education: Optional[str] = None
    experience: Optional[str] = None
    memberships: Optional[str] = None
    service_point_id: Optional[str] = None
    room_number: Optional[str] = None
    room_name: Optional[str] = None
    schedules: List[DoctorScheduleSlotItem] = []

    model_config = ConfigDict(from_attributes=True)
