import uuid
from sqlalchemy import Column, String, Integer, Numeric, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class PackageTier(Base):
    """Cấp độ gói khám (Cơ bản, Tiêu chuẩn, Nâng cao, VIP)."""
    __tablename__ = "package_tiers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    tier_order = Column(Integer, nullable=False, default=1)

    packages = relationship("Package", back_populates="tier")


class Package(Base):
    """Gói khám."""
    __tablename__ = "packages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    package_type = Column(String(50), nullable=False, default="INDIVIDUAL")  # INDIVIDUAL, ENTERPRISE
    target_group = Column(String(100), nullable=True)  # Mọi đối tượng, Nữ, Nam...
    description = Column(Text, nullable=True)
    base_price = Column(Numeric(12, 2), nullable=False, default=0)
    package_tier_id = Column(String(36), ForeignKey("package_tiers.id"), nullable=True)
    status = Column(String(20), nullable=False, default="ACTIVE")

    tier = relationship("PackageTier", back_populates="packages")
    service_items = relationship("PackageServiceItem", back_populates="package", cascade="all, delete-orphan")


class PackageServiceItem(Base):
    """Liên kết Gói khám và Dịch vụ khám kèm theo."""
    __tablename__ = "package_service_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=False)
    exam_service_id = Column(String(36), ForeignKey("exam_services.id"), nullable=False)
    is_mandatory = Column(Boolean, nullable=False, default=True)

    package = relationship("Package", back_populates="service_items")
    exam_service = relationship("ExamService")


class Constraint(Base):
    """Bảng ràng buộc nghiệp vụ (Khám theo dữ liệu, không hardcode)."""
    __tablename__ = "constraints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    constraint_level = Column(String(20), nullable=False, default="STRICT")  # STRICT, WARNING
    status = Column(String(20), nullable=False, default="ACTIVE")


class PackageConstraint(Base):
    """Ràng buộc giữa các gói khám (Loại trừ, phải đi kèm, bao gồm)."""
    __tablename__ = "package_constraints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    constraint_id = Column(String(36), ForeignKey("constraints.id"), nullable=False)
    source_package_id = Column(String(36), ForeignKey("packages.id"), nullable=False)
    target_package_id = Column(String(36), ForeignKey("packages.id"), nullable=False)
    relation_type = Column(String(30), nullable=False)  # MUTEX, REQUIRED, INCLUDES


class PackageTierConstraint(Base):
    """Ràng buộc giữa gói khám và cấp độ."""
    __tablename__ = "package_tier_constraints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    constraint_id = Column(String(36), ForeignKey("constraints.id"), nullable=False)
    package_id = Column(String(36), ForeignKey("packages.id"), nullable=False)
    package_tier_id = Column(String(36), ForeignKey("package_tiers.id"), nullable=False)
    relation_type = Column(String(30), nullable=False)
    condition_json = Column(JSON, nullable=True)


class StepConstraint(Base):
    """Ràng buộc thứ tự/phụ thuộc giữa các bước khám (Dịch vụ trước -> Dịch vụ sau)."""
    __tablename__ = "step_constraints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    constraint_id = Column(String(36), ForeignKey("constraints.id"), nullable=False)
    prior_service_id = Column(String(36), ForeignKey("exam_services.id"), nullable=False)
    later_service_id = Column(String(36), ForeignKey("exam_services.id"), nullable=False)
    relation_type = Column(String(30), nullable=False, default="PRECEDES")  # PRECEDES, MUTEX, FASTING_REQUIRED
