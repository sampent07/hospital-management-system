"""Add patient self-service registration, packages and appointment check-in."""
from alembic import op
import sqlalchemy as sa

revision = "20261115_patient_app_flow"
down_revision = None
branch_labels = None
depends_on = None


def _tables():
    return set(sa.inspect(op.get_bind()).get_table_names())


def _columns(table_name: str):
    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table_name)}


def upgrade() -> None:
    tables = _tables()
    # Project hiện khởi tạo core schema từ metadata; migration chỉ bổ sung schema trên DB đã có core tables.
    if not {"accounts", "patients", "packages"}.issubset(tables):
        return
    if "patient_package_registrations" not in tables:
        op.create_table(
            "patient_package_registrations",
            sa.Column("id", sa.String(length=36), primary_key=True),
            sa.Column("patient_id", sa.String(length=36), sa.ForeignKey("patients.id"), nullable=False),
            sa.Column("package_id", sa.String(length=36), sa.ForeignKey("packages.id"), nullable=False),
            sa.Column("price_snapshot", sa.Numeric(12, 2), nullable=False),
            sa.Column("status", sa.String(length=30), nullable=False),
            sa.Column("requested_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("reviewed_by_id", sa.String(length=36), sa.ForeignKey("accounts.id"), nullable=True),
            sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("paid_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("payment_method", sa.String(length=20), nullable=True),
        )
        op.create_index("ix_patient_package_registrations_patient_id", "patient_package_registrations", ["patient_id"])

    if "appointments" in tables:
        columns = _columns("appointments")
        with op.batch_alter_table("appointments") as batch_op:
            if "package_registration_id" not in columns:
                batch_op.add_column(sa.Column("package_registration_id", sa.String(length=36), nullable=True))
                batch_op.create_foreign_key(
                    "fk_appointments_package_registration_id",
                    "patient_package_registrations",
                    ["package_registration_id"],
                    ["id"],
                )
                batch_op.create_index(
                    "uq_appointments_package_registration_id", ["package_registration_id"], unique=True
                )
            if "appointment_code" not in columns:
                batch_op.add_column(sa.Column("appointment_code", sa.String(length=40), nullable=True))
                batch_op.create_index("ix_appointments_appointment_code", ["appointment_code"], unique=True)

    if "visits" in tables:
        columns = _columns("visits")
        if "appointment_id" not in columns:
            with op.batch_alter_table("visits") as batch_op:
                batch_op.add_column(sa.Column("appointment_id", sa.String(length=36), nullable=True))
                batch_op.create_foreign_key("fk_visits_appointment_id", "appointments", ["appointment_id"], ["id"])
                batch_op.create_index("uq_visits_appointment_id", ["appointment_id"], unique=True)

    if "patient_verifications" not in tables:
        op.create_table(
            "patient_verifications",
            sa.Column("account_id", sa.String(length=36), sa.ForeignKey("accounts.id"), primary_key=True),
            sa.Column("code_hash", sa.String(length=255), nullable=False),
            sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    tables = _tables()
    if "patient_verifications" in tables:
        op.drop_table("patient_verifications")
    if "patient_package_registrations" in tables:
        if "appointments" in tables and "package_registration_id" in _columns("appointments"):
            op.drop_index("uq_appointments_package_registration_id", table_name="appointments")
        op.drop_table("patient_package_registrations")
    if "visits" in tables and "appointment_id" in _columns("visits"):
        op.drop_index("uq_visits_appointment_id", table_name="visits")
        op.drop_constraint("fk_visits_appointment_id", "visits", type_="foreignkey")
        op.drop_column("visits", "appointment_id")
    if "appointments" in tables:
        columns = _columns("appointments")
        if "appointment_code" in columns:
            op.drop_index("ix_appointments_appointment_code", table_name="appointments")
            op.drop_column("appointments", "appointment_code")
        if "package_registration_id" in columns:
            op.drop_constraint("fk_appointments_package_registration_id", "appointments", type_="foreignkey")
            op.drop_column("appointments", "package_registration_id")
