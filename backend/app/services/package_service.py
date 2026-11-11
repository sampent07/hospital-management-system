from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.package import Package, PackageTier, ExamService, PackageServiceItem
from app.repositories.package_repository import PackageRepository
from app.schemas.package import (
    PackageResponse,
    ExamServiceItemResponse,
    PackageAdvisorRequest,
    PackageAdvisorResponse,
)


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
