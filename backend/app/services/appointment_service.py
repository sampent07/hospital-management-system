from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.customer import Appointment, Patient
from app.models.package import Package
from app.core.exceptions import ResourceNotFound
from app.schemas.appointment import AppointmentCreate, AppointmentResponse


class AppointmentService:
    def __init__(self, db: Session):
        self.db = db

    def list_appointments(
        self,
        status: Optional[str] = None,
        patient_id: Optional[str] = None,
        limit: int = 100
    ) -> List[AppointmentResponse]:
        q = self.db.query(Appointment)
        if status:
            q = q.filter(Appointment.status == status)
        if patient_id:
            q = q.filter(Appointment.patient_id == patient_id)

        appointments = q.order_by(Appointment.appointment_time.asc()).limit(limit).all()
        result = []
        for appt in appointments:
            pat = self.db.query(Patient).filter(Patient.id == appt.patient_id).first()
            pkg = self.db.query(Package).filter(Package.id == appt.package_id).first() if appt.package_id else None
            result.append(
                AppointmentResponse(
                    id=appt.id,
                    patient_id=appt.patient_id,
                    patient_name=pat.full_name if pat else "N/A",
                    patient_phone=pat.phone_number if pat else "N/A",
                    package_id=appt.package_id,
                    package_name=pkg.name if pkg else None,
                    appointment_time=appt.appointment_time,
                    appointment_type=appt.appointment_type,
                    notes=appt.notes,
                    status=appt.status
                )
            )
        return result

    def create_appointment(self, req: AppointmentCreate) -> AppointmentResponse:
        pat = self.db.query(Patient).filter(Patient.id == req.patient_id).first()
        if not pat:
            raise ResourceNotFound("Patient", req.patient_id)

        pkg_name = None
        if req.package_id:
            pkg = self.db.query(Package).filter(Package.id == req.package_id).first()
            if pkg:
                pkg_name = pkg.name

        appt = Appointment(
            patient_id=req.patient_id,
            package_id=req.package_id,
            appointment_time=req.appointment_time,
            appointment_type=req.appointment_type,
            notes=req.notes,
            status="SCHEDULED"
        )
        self.db.add(appt)
        self.db.commit()
        self.db.refresh(appt)

        return AppointmentResponse(
            id=appt.id,
            patient_id=appt.patient_id,
            patient_name=pat.full_name,
            patient_phone=pat.phone_number,
            package_id=appt.package_id,
            package_name=pkg_name,
            appointment_time=appt.appointment_time,
            appointment_type=appt.appointment_type,
            notes=appt.notes,
            status=appt.status
        )

    def update_appointment_status(self, appointment_id: str, new_status: str) -> AppointmentResponse:
        appt = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appt:
            raise ResourceNotFound("Appointment", appointment_id)

        appt.status = new_status
        self.db.commit()
        self.db.refresh(appt)

        pat = self.db.query(Patient).filter(Patient.id == appt.patient_id).first()
        pkg = self.db.query(Package).filter(Package.id == appt.package_id).first() if appt.package_id else None

        return AppointmentResponse(
            id=appt.id,
            patient_id=appt.patient_id,
            patient_name=pat.full_name if pat else "N/A",
            patient_phone=pat.phone_number if pat else "N/A",
            package_id=appt.package_id,
            package_name=pkg.name if pkg else None,
            appointment_time=appt.appointment_time,
            appointment_type=appt.appointment_type,
            notes=appt.notes,
            status=appt.status
        )
