from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.account import Account, StaffMember, Doctor
from app.repositories.base import BaseRepository


class AccountRepository(BaseRepository[Account]):
    def __init__(self, db: Session):
        super().__init__(Account, db)

    def get_by_username(self, username: str) -> Optional[Account]:
        return self.db.query(Account).filter(Account.username == username).first()

    def get_by_employee_code(self, code: str) -> Optional[Account]:
        return self.db.query(Account).filter(Account.employee_code == code).first()

    def get_active_staff(self) -> List[Account]:
        return self.db.query(Account).filter(Account.role.in_(["ADMIN", "COORDINATOR", "DOCTOR"]), Account.status == "ACTIVE").all()
