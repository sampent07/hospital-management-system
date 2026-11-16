from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.account import Account
from app.models.customer import Appointment, Patient, PatientPackageRegistration, PatientVerification
from app.models.package import Package
from app.models.visit import Visit, VisitProgress
from app.repositories.base import BaseRepository


class PatientRepository(BaseRepository[Patient]):
    """Truy vấn hồ sơ bệnh nhân và các bản ghi nghiệp vụ riêng của bệnh nhân."""

    def __init__(self, db: Session):
        super().__init__(Patient, db)

    def get_by_account_id(self, account_id: str) -> Optional[Patient]:
        return self.db.query(Patient).filter(Patient.account_id == account_id).first()

    def list_by_account_id(self, account_id: str) -> List[Patient]:
        return self.db.query(Patient).filter(Patient.account_id == account_id).order_by(Patient.created_at.asc()).all()

    def get_by_patient_code(self, patient_code: str) -> Optional[Patient]:
        return self.db.query(Patient).filter(Patient.patient_code.ilike(patient_code.strip())).first()

    def lookup_patients(
        self,
        phone_number: str,
        full_name: Optional[str] = None,
        gender: Optional[str] = None,
        id_card_number: Optional[str] = None,
    ) -> List[Patient]:
        query = self.db.query(Patient)
        if id_card_number:
            query = query.filter(Patient.id_card_number == id_card_number.strip())
        elif phone_number:
            query = query.filter(Patient.phone_number == phone_number.strip())
            if full_name:
                query = query.filter(Patient.full_name.ilike(f"%{full_name.strip()}%"))
            if gender:
                query = query.filter(Patient.gender == gender.strip().upper())
        return query.limit(10).all()

    def get_account_by_username(self, username: str) -> Optional[Account]:
        return self.db.query(Account).filter(Account.username == username).first()

    def get_account(self, account_id: str) -> Optional[Account]:
        return self.db.query(Account).filter(Account.id == account_id).first()

    def get_package(self, package_id: str) -> Optional[Package]:
        return self.db.query(Package).filter(Package.id == package_id).first()

    def get_verification(self, account_id: str) -> Optional[PatientVerification]:
        return self.db.query(PatientVerification).filter(PatientVerification.account_id == account_id).first()

    def get_registration(self, registration_id: str) -> Optional[PatientPackageRegistration]:
        return self.db.query(PatientPackageRegistration).options(
            joinedload(PatientPackageRegistration.package)
        ).filter(PatientPackageRegistration.id == registration_id).first()

    def list_registrations(self, patient_id: str) -> List[PatientPackageRegistration]:
        return self.db.query(PatientPackageRegistration).options(
            joinedload(PatientPackageRegistration.package)
        ).filter(
            PatientPackageRegistration.patient_id == patient_id
        ).order_by(PatientPackageRegistration.requested_at.desc()).all()

    def list_pending_registrations(self) -> List[PatientPackageRegistration]:
        return self.db.query(PatientPackageRegistration).options(
            joinedload(PatientPackageRegistration.patient),
            joinedload(PatientPackageRegistration.package),
        ).filter(
            PatientPackageRegistration.status == "PENDING_APPROVAL"
        ).order_by(PatientPackageRegistration.requested_at.asc()).all()

    def get_appointment_by_code(self, appointment_code: str) -> Optional[Appointment]:
        return self.db.query(Appointment).filter(Appointment.appointment_code == appointment_code).first()

    def get_appointment(self, appointment_id: str) -> Optional[Appointment]:
        return self.db.query(Appointment).filter(Appointment.id == appointment_id).first()

    def list_appointments(self, patient_id: str) -> List[Appointment]:
        return self.db.query(Appointment).filter(
            Appointment.patient_id == patient_id
        ).order_by(Appointment.appointment_time.desc()).all()

    def get_visit_for_appointment(self, appointment_id: str):
        return self.db.query(Visit).filter(Visit.appointment_id == appointment_id).first()

    def list_visits(self, patient_id: str) -> list[Visit]:
        return self.db.query(Visit).options(
            joinedload(Visit.patient),
            joinedload(Visit.package),
            joinedload(Visit.progress_items).joinedload(VisitProgress.exam_service),
            joinedload(Visit.progress_items).joinedload(VisitProgress.service_point),
        ).filter(Visit.patient_id == patient_id).order_by(Visit.check_in_at.desc()).all()
