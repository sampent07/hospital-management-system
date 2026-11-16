from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.account import Authorization, Account, Doctor, StaffMember
from app.core.exceptions import ResourceNotFound, AppException
from app.core.database import get_utc_now
from app.schemas.authorization import AuthorizationCreate, AuthorizationResponse


class AuthorizationService:
    def __init__(self, db: Session):
        self.db = db

    def _get_or_ensure_doctor_id(self, account_id: str) -> str:
        doc = self.db.query(Doctor).filter(Doctor.id == account_id).first()
        if not doc:
            acc = self.db.query(Account).filter(Account.id == account_id).first()
            if acc:
                doc = Doctor(id=account_id, specialty="Đa khoa", license_number="CCHN-DOC")
                self.db.add(doc)
                self.db.flush()
        return account_id

    def _get_or_ensure_coordinator_id(self, account_id: str) -> str:
        staff = self.db.query(StaffMember).filter(StaffMember.id == account_id).first()
        if not staff:
            acc = self.db.query(Account).filter(Account.id == account_id).first()
            if acc:
                staff = StaffMember(id=account_id, staff_type="COORDINATOR")
                self.db.add(staff)
                self.db.flush()
        return account_id

    def list_authorizations(self, current_user_id: str, role: str) -> List[AuthorizationResponse]:
        q = self.db.query(Authorization)
        if role == "DOCTOR":
            q = q.filter(Authorization.doctor_id == current_user_id)
        elif role == "COORDINATOR":
            q = q.filter(Authorization.coordinator_id == current_user_id)

        items = q.order_by(Authorization.started_at.desc()).all()
        result = []
        for item in items:
            doc_acc = self.db.query(Account).filter(Account.id == item.doctor_id).first()
            coord_acc = self.db.query(Account).filter(Account.id == item.coordinator_id).first()
            result.append(
                AuthorizationResponse(
                    id=item.id,
                    doctor_id=item.doctor_id,
                    doctor_name=doc_acc.full_name if doc_acc else "Bác sĩ",
                    coordinator_id=item.coordinator_id,
                    coordinator_name=coord_acc.full_name if coord_acc else "Thư ký",
                    scope=item.scope,
                    started_at=item.started_at,
                    ended_at=item.ended_at,
                    accepted_at=item.accepted_at,
                    status=item.status
                )
            )
        return result

    def create_authorization(self, doctor_account_id: str, req: AuthorizationCreate) -> AuthorizationResponse:
        coord_acc = self.db.query(Account).filter(Account.id == req.coordinator_id).first()
        if not coord_acc:
            raise ResourceNotFound("Coordinator Account", req.coordinator_id)

        doc_id = self._get_or_ensure_doctor_id(doctor_account_id)
        coord_id = self._get_or_ensure_coordinator_id(req.coordinator_id)

        auth = Authorization(
            doctor_id=doc_id,
            coordinator_id=coord_id,
            scope=req.scope,
            started_at=get_utc_now(),
            ended_at=req.ended_at,
            status="PENDING"
        )
        self.db.add(auth)
        self.db.commit()
        self.db.refresh(auth)

        doc_acc = self.db.query(Account).filter(Account.id == doctor_account_id).first()
        return AuthorizationResponse(
            id=auth.id,
            doctor_id=auth.doctor_id,
            doctor_name=doc_acc.full_name if doc_acc else "Bác sĩ",
            coordinator_id=auth.coordinator_id,
            coordinator_name=coord_acc.full_name,
            scope=auth.scope,
            started_at=auth.started_at,
            ended_at=auth.ended_at,
            accepted_at=auth.accepted_at,
            status=auth.status
        )

    def accept_authorization(self, auth_id: str, coordinator_account_id: str) -> AuthorizationResponse:
        auth = self.db.query(Authorization).filter(Authorization.id == auth_id).first()
        if not auth:
            raise ResourceNotFound("Authorization", auth_id)

        if auth.coordinator_id != coordinator_account_id:
            raise AppException(code="FORBIDDEN_AUTH", message="Bạn không phải thư ký được chỉ định cho ủy quyền này.", status_code=403)

        auth.status = "ACTIVE"
        auth.accepted_at = get_utc_now()
        self.db.commit()
        self.db.refresh(auth)

        doc_acc = self.db.query(Account).filter(Account.id == auth.doctor_id).first()
        coord_acc = self.db.query(Account).filter(Account.id == auth.coordinator_id).first()
        return AuthorizationResponse(
            id=auth.id,
            doctor_id=auth.doctor_id,
            doctor_name=doc_acc.full_name if doc_acc else "Bác sĩ",
            coordinator_id=auth.coordinator_id,
            coordinator_name=coord_acc.full_name if coord_acc else "Thư ký",
            scope=auth.scope,
            started_at=auth.started_at,
            ended_at=auth.ended_at,
            accepted_at=auth.accepted_at,
            status=auth.status
        )

    def revoke_authorization(self, auth_id: str, doctor_account_id: str) -> AuthorizationResponse:
        auth = self.db.query(Authorization).filter(Authorization.id == auth_id).first()
        if not auth:
            raise ResourceNotFound("Authorization", auth_id)

        auth.status = "REVOKED"
        self.db.commit()
        self.db.refresh(auth)

        doc_acc = self.db.query(Account).filter(Account.id == auth.doctor_id).first()
        coord_acc = self.db.query(Account).filter(Account.id == auth.coordinator_id).first()
        return AuthorizationResponse(
            id=auth.id,
            doctor_id=auth.doctor_id,
            doctor_name=doc_acc.full_name if doc_acc else "Bác sĩ",
            coordinator_id=auth.coordinator_id,
            coordinator_name=coord_acc.full_name if coord_acc else "Thư ký",
            scope=auth.scope,
            started_at=auth.started_at,
            ended_at=auth.ended_at,
            accepted_at=auth.accepted_at,
            status=auth.status
        )
