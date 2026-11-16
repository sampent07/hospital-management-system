from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.customer import Patient, MedicalRecord
from app.models.visit import Visit
from app.core.exceptions import ResourceNotFound
from app.schemas.patient import PatientCreate, PatientUpdate, MedicalRecordCreate


class PatientService:
    def __init__(self, db: Session):
        self.db = db

    def search_patients(self, query: Optional[str] = None, limit: int = 50) -> List[Patient]:
        """Tìm kiếm bệnh nhân theo tên, số điện thoại hoặc CCCD."""
        q = self.db.query(Patient)
        if query:
            search_pattern = f"%{query.strip()}%"
            q = q.filter(
                or_(
                    Patient.full_name.ilike(search_pattern),
                    Patient.phone_number.ilike(search_pattern),
                    Patient.id_card_number.ilike(search_pattern),
                    Patient.id.ilike(search_pattern)
                )
            )
        return q.order_by(Patient.created_at.desc()).limit(limit).all()

    def get_patient_by_id(self, patient_id: str) -> Patient:
        """Lấy thông tin chi tiết một bệnh nhân kèm hồ sơ tiền sử bệnh."""
        patient = self.db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise ResourceNotFound("Patient", patient_id)
        return patient

    def create_patient(self, req: PatientCreate) -> Patient:
        """Tạo hồ sơ bệnh nhân mới."""
        patient = Patient(
            full_name=req.full_name,
            date_of_birth=req.date_of_birth,
            gender=req.gender,
            phone_number=req.phone_number,
            email=req.email,
            address=req.address,
            id_card_number=req.id_card_number,
            marital_status=req.marital_status
        )
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update_patient(self, patient_id: str, req: PatientUpdate) -> Patient:
        """Cập nhật thông tin hành chính bệnh nhân."""
        patient = self.get_patient_by_id(patient_id)
        if req.full_name is not None:
            patient.full_name = req.full_name
        if req.phone_number is not None:
            patient.phone_number = req.phone_number
        if req.email is not None:
            patient.email = req.email
        if req.address is not None:
            patient.address = req.address
        if req.id_card_number is not None:
            patient.id_card_number = req.id_card_number
        if req.marital_status is not None:
            patient.marital_status = req.marital_status

        self.db.commit()
        self.db.refresh(patient)
        return patient

    def add_medical_record(self, patient_id: str, req: MedicalRecordCreate) -> MedicalRecord:
        """Thêm/cập nhật tiền sử bệnh lý của bệnh nhân."""
        patient = self.get_patient_by_id(patient_id)
        record = MedicalRecord(
            patient_id=patient.id,
            medical_history=req.medical_history,
            family_history=req.family_history,
            allergies=req.allergies
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record
