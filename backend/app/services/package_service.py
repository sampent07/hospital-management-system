from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.package import Package, PackageTier, PackageServiceItem
from app.models.service import ExamService, ServicePoint
from app.models.account import Doctor
from app.models.customer import DoctorSchedule
from app.repositories.route_repository import PackageRepository
from app.schemas.package import (
    PackageResponse,
    ExamServiceItemResponse,
    PackageAdvisorRequest,
    PackageAdvisorResponse,
)
from app.schemas.patient import (
    DayAvailabilityResponse,
    DoctorScheduleSlotResponse,
    PackageAvailableSchedulesResponse,
)
from app.core.exceptions import ResourceNotFound


class PackageService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PackageRepository(db)

    def get_active_packages(self) -> List[PackageResponse]:
        packages = self.repo.get_all_active_packages()
        results = []
        for p in packages:
            services = []
            for item in p.service_items:
                es = item.exam_service
                sp = es.default_service_point if es else None
                services.append(
                    ExamServiceItemResponse(
                        id=es.id,
                        code=es.code,
                        name=es.name,
                        category=es.category,
                        has_result_waiting=es.has_result_waiting,
                        default_service_point_id=es.default_service_point_id,
                        service_point_name=sp.name if sp else None
                    )
                )
            results.append(
                PackageResponse(
                    id=p.id,
                    code=p.code,
                    name=p.name,
                    package_type=p.package_type,
                    target_group=p.target_group,
                    description=p.description,
                    base_price=float(p.base_price),
                    tier_name=p.tier.name if p.tier else None,
                    services=services
                )
            )
        return results

    def advise_package(self, req: PackageAdvisorRequest) -> PackageAdvisorResponse:
        """Gợi ý gói khám theo quy tắc định sẵn (DOMAIN_RULES Mục 8).
        
        Bắt buộc hiển thị cảnh báo không thay thế tư vấn y khoa.
        """
        all_packages = self.get_active_packages()
        recommended = None
        alternatives = []
        explanation = ""

        # Gợi ý dựa trên tuổi, giới tính và tình trạng hôn nhân
        if req.gender == "FEMALE" and req.marital_status == "MARRIED":
            # Ưu tiên gói toàn diện phụ nữ
            for p in all_packages:
                if "nữ" in p.name.lower() or "toàn diện" in p.name.lower():
                    recommended = p
                    break
            explanation = "Gợi ý gói khám chuyên sâu cho nữ giới đã có gia đình bao gồm tầm soát phụ khoa và ung thư vú."

        elif req.age >= 50:
            for p in all_packages:
                if "nâng cao" in p.name.lower() or "vip" in p.name.lower():
                    recommended = p
                    break
            explanation = "Người trên 50 tuổi nên thực hiện gói tầm soát nâng cao để kiểm tra tim mạch, đường huyết và chức năng tạng."

        else:
            # Gói tiêu chuẩn / cơ bản
            for p in all_packages:
                if "tiêu chuẩn" in p.name.lower() or "cơ bản" in p.name.lower():
                    recommended = p
                    break
            explanation = "Gói khám sức khỏe tổng quát tiêu chuẩn phù hợp định kỳ cho người trưởng thành."

        if not recommended and all_packages:
            recommended = all_packages[0]

        alternatives = [p for p in all_packages if recommended and p.id != recommended.id][:2]

        return PackageAdvisorResponse(
            recommended_package=recommended,
            alternative_packages=alternatives,
            explanation=explanation
        )

    def get_available_schedules_for_package(
        self, package_id: str, year_month: Optional[str] = None
    ) -> PackageAvailableSchedulesResponse:
        """Tính toán lịch khám khả dụng cho gói khám theo bác sĩ và ngày trong tháng.
        
        Quy tắc trạng thái:
        - AVAILABLE (Xanh): Có slot bác sĩ làm việc và còn chỗ (remaining_slots > 0)
        - FULL (Vàng): Có slot bác sĩ làm việc nhưng tất cả các slot đã kín chỗ (remaining_slots == 0)
        - UNAVAILABLE (Xám): Bác sĩ không có lịch trực / không có dịch vụ vào ngày đó
        """
        package = self.repo.get_by_id(package_id)
        if not package:
            raise ResourceNotFound("Package", package_id)

        now = datetime.now()
        if year_month:
            parts = year_month.split("-")
            target_year = int(parts[0])
            target_month = int(parts[1])
        else:
            target_year = now.year
            target_month = now.month

        # Xác định số ngày trong tháng
        import calendar
        _, num_days = calendar.monthrange(target_year, target_month)
        start_date = date(target_year, target_month, 1)
        end_date = date(target_year, target_month, num_days)

        # Lấy các lịch khám của gói hoặc dịch vụ chung trong tháng
        schedules = self.db.query(DoctorSchedule).filter(
            DoctorSchedule.work_date >= start_date,
            DoctorSchedule.work_date <= end_date,
            DoctorSchedule.status != "CANCELLED",
            or_(
                DoctorSchedule.package_id == package_id,
                DoctorSchedule.package_id.is_(None)
            )
        ).all()

        # Nhóm theo ngày (YYYY-MM-DD)
        schedules_by_date = {}
        for s in schedules:
            d_str = s.work_date.isoformat()
            if d_str not in schedules_by_date:
                schedules_by_date[d_str] = []
            schedules_by_date[d_str].append(s)

        # Dựng danh sách ngày trong tháng
        day_results: List[DayAvailabilityResponse] = []
        for d in range(1, num_days + 1):
            cur_date = date(target_year, target_month, d)
            cur_str = cur_date.isoformat()

            day_scheds = schedules_by_date.get(cur_str, [])

            # Nếu là ngày trong quá khứ hoặc là Chủ nhật (weekday == 6) hoặc không có lịch trực bác sĩ
            if cur_date < now.date() or cur_date.weekday() == 6 or not day_scheds:
                day_results.append(DayAvailabilityResponse(
                    date=cur_str,
                    status="UNAVAILABLE",
                    total_slots=0,
                    remaining_slots=0,
                    slots=[]
                ))
                continue

            slots_resp: List[DoctorScheduleSlotResponse] = []
            total_slots = 0
            total_booked = 0

            for s in day_scheds:
                rem = max(0, s.max_slots - s.current_booked)
                total_slots += s.max_slots
                total_booked += s.current_booked

                doc_name = s.doctor.staff_member.account.full_name if (s.doctor and s.doctor.staff_member and s.doctor.staff_member.account) else "Bác sĩ phụ trách"
                specialty = s.doctor.specialty if s.doctor else "Đa khoa"
                room_no = s.service_point.room_number if s.service_point else ""
                room_nm = s.service_point.name if s.service_point else ""

                slots_resp.append(DoctorScheduleSlotResponse(
                    id=s.id,
                    doctor_id=s.doctor_id,
                    doctor_name=doc_name,
                    specialty=specialty,
                    service_point_id=s.service_point_id,
                    room_number=room_no,
                    room_name=room_nm,
                    work_date=s.work_date,
                    start_time=s.start_time,
                    end_time=s.end_time,
                    max_slots=s.max_slots,
                    current_booked=s.current_booked,
                    remaining_slots=rem,
                    status="FULL" if rem == 0 else s.status
                ))

            rem_day = max(0, total_slots - total_booked)
            status_day = "FULL" if rem_day == 0 else "AVAILABLE"

            day_results.append(DayAvailabilityResponse(
                date=cur_str,
                status=status_day,
                total_slots=total_slots,
                remaining_slots=rem_day,
                slots=slots_resp
            ))

        return PackageAvailableSchedulesResponse(
            package_id=package.id,
            package_name=package.name,
            month=f"{target_year:04d}-{target_month:02d}",
            days=day_results
        )
