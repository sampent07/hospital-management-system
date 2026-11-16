from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.package import Package, Constraint, StepConstraint
from app.repositories.base import BaseRepository


class PackageRepository(BaseRepository[Package]):
    def __init__(self, db: Session):
        super().__init__(Package, db)

    def get_all_active_packages(self) -> List[Package]:
        return (
            self.db.query(Package)
            .options(
                joinedload(Package.tier),
                joinedload(Package.service_items)
            )
            .filter(Package.status == "ACTIVE")
            .all()
        )

    def get_all_constraints(self) -> List[Constraint]:
        return self.db.query(Constraint).filter(Constraint.status == "ACTIVE").all()

    def get_step_constraints(self) -> List[StepConstraint]:
        return self.db.query(StepConstraint).all()
