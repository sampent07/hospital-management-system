from datetime import datetime, date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.account import Doctor, StaffMember, Account
from app.models.customer import DoctorSchedule
from app.models.service import ServicePoint
from app.schemas.doctor import DoctorListItem, DoctorDetail, DoctorScheduleSlotItem
from app.core.exceptions import ResourceNotFound


class DoctorService:
    def __init__(self, db: Session):
        self.db = db

    def list_doctors(
        self,
        specialty: Optional[str] = None,
        day_of_week: Optional[str] = None,
        q: Optional[str] = None,
    ) -> List[DoctorListItem]:
        """Liệt kê danh sách bác sĩ kèm lọc theo chuyên khoa, thứ trong tuần và tìm kiếm."""
        query = self.db.query(Doctor).join(StaffMember, Doctor.id == StaffMember.id).join(Account, StaffMember.id == Account.id)

        if specialty and specialty != "ALL":
            query = query.filter(Doctor.specialty.ilike(f"%{specialty.strip()}%"))

        if q and q.strip():
            kw = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    Account.full_name.ilike(kw),
                    Doctor.specialty.ilike(kw),
                    Doctor.academic_title.ilike(kw)
                )
            )

        doctors = query.all()
        results: List[DoctorListItem] = []

        # Ánh xạ thứ trong tuần: 2 -> Thứ 2 (weekday 0), 3 -> Thứ 3 (weekday 1)... 7 -> Thứ 7 (weekday 5)
        dow_target = None
        if day_of_week and day_of_week != "ALL":
            try:
                # Nếu truyền "2" -> weekday 0; "3" -> weekday 1 ... "7" -> weekday 5
                val = int(day_of_week)
                if 2 <= val <= 7:
                    dow_target = val - 2
            except ValueError:
                pass

        now = datetime.now()

        for doc in doctors:
            # Lấy các lịch khám sắp tới của bác sĩ để xác định các thứ bác sĩ có lịch
            schedules = self.db.query(DoctorSchedule).filter(
                DoctorSchedule.doctor_id == doc.id,
                DoctorSchedule.work_date >= now.date(),
                DoctorSchedule.status != "CANCELLED"
            ).order_by(DoctorSchedule.work_date.asc(), DoctorSchedule.start_time.asc()).all()

            # Tập hợp các thứ có lịch: 0 -> "2", 1 -> "3", ..., 5 -> "7"
            weekdays_present = set()
            for s in schedules:
                w = s.work_date.weekday()
                if w < 6: # Không tính Chủ nhật
                    weekdays_present.add(w)

            # Lọc theo thứ nếu có
            if dow_target is not None and dow_target not in weekdays_present:
                continue

            available_days_str = [str(w + 2) for w in sorted(weekdays_present)]

            # Xác định phòng khám mặc định từ ca trực đầu tiên
            first_sp = schedules[0].service_point if schedules and schedules[0].service_point else None

            results.append(DoctorListItem(
                id=doc.id,
                full_name=doc.staff_member.account.full_name if (doc.staff_member and doc.staff_member.account) else "Bác sĩ",
                academic_title=doc.academic_title or "BS. CK1",
                specialty=doc.specialty,
                avatar_url=doc.avatar_url,
                license_number=doc.license_number,
                schedule_summary=doc.schedule_summary or "Sáng Thứ 2 - Thứ 6",
                service_point_id=first_sp.id if first_sp else None,
                room_number=first_sp.room_number if first_sp else "Phòng 101",
                room_name=first_sp.name if first_sp else "Phòng Khám Tổng Quát",
                available_days=available_days_str
            ))

        return results

    def get_doctor_detail(self, doctor_id: str) -> DoctorDetail:
        """Lấy chi tiết bác sĩ gồm hồ sơ đào tạo, công tác, hiệp hội và lịch trực."""
        doc = self.db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doc:
            raise ResourceNotFound("Doctor", doctor_id)

        now = datetime.now()
        schedules = self.db.query(DoctorSchedule).filter(
            DoctorSchedule.doctor_id == doc.id,
            DoctorSchedule.work_date >= now.date(),
            DoctorSchedule.status != "CANCELLED"
        ).order_by(DoctorSchedule.work_date.asc(), DoctorSchedule.start_time.asc()).limit(30).all()

        first_sp = schedules[0].service_point if schedules and schedules[0].service_point else None

        slots_resp: List[DoctorScheduleSlotItem] = []
        for s in schedules:
            sp = s.service_point
            rem = max(0, s.max_slots - s.current_booked)
            slots_resp.append(DoctorScheduleSlotItem(
                id=s.id,
                work_date=s.work_date,
                start_time=s.start_time,
                end_time=s.end_time,
                max_slots=s.max_slots,
                current_booked=s.current_booked,
                remaining_slots=rem,
                status="FULL" if rem == 0 else s.status,
                service_point_id=s.service_point_id,
                room_number=sp.room_number if sp else None,
                room_name=sp.name if sp else None,
            ))

        return DoctorDetail(
            id=doc.id,
            full_name=doc.staff_member.account.full_name if (doc.staff_member and doc.staff_member.account) else "Bác sĩ",
            academic_title=doc.academic_title or "BS. CK1",
            specialty=doc.specialty,
            avatar_url=doc.avatar_url,
            license_number=doc.license_number,
            schedule_summary=doc.schedule_summary,
            education=doc.education,
            experience=doc.experience,
            memberships=doc.memberships,
            service_point_id=first_sp.id if first_sp else None,
            room_number=first_sp.room_number if first_sp else "Phòng 101",
            room_name=first_sp.name if first_sp else "Phòng Khám Tổng Quát",
            schedules=slots_resp
        )

    def list_specialties(self) -> List[str]:
        """Danh sách các chuyên khoa hiện có của bệnh viện."""
        rows = self.db.query(Doctor.specialty).distinct().all()
        return [r[0] for r in rows if r[0]]
