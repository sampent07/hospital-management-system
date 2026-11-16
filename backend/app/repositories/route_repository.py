from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.route import Route, RouteStep, RouteDecision
from app.models.package import Package, PackageTier, Constraint, StepConstraint
from app.models.service import ExamService, ServicePoint
from app.models.account import Account
from app.models.customer import Patient
from app.models.visit import Visit
from app.repositories.base import BaseRepository


class RouteRepository(BaseRepository[Route]):
    def __init__(self, db: Session):
        super().__init__(Route, db)

    def get_active_route_for_visit(self, visit_id: str) -> Optional[Route]:
        return (
            self.db.query(Route)
            .options(
                joinedload(Route.steps).joinedload(RouteStep.visit_progress)
            )
            .filter(Route.visit_id == visit_id, Route.status == "ACTIVE")
            .order_by(Route.version.desc())
            .first()
        )

    def deactivate_previous_routes(self, visit_id: str) -> None:
        self.db.query(Route).filter(Route.visit_id == visit_id, Route.status == "ACTIVE").update({"status": "REPLACED"})
        self.db.flush()

    def patient_owns_visit(self, account_id: str, visit_id: str) -> bool:
        return self.db.query(Visit.id).join(Patient, Patient.id == Visit.patient_id).filter(
            Visit.id == visit_id,
            Patient.account_id == account_id,
        ).first() is not None

    def get_account_role(self, account_id: str) -> Optional[str]:
        account = self.db.query(Account.role).filter(Account.id == account_id).first()
        return account[0] if account else None


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
