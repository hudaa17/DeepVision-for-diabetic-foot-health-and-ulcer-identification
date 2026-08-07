# Import all models to register them on the Base metadata
from app.core.database import Base
from app.models.user import User
from app.models.patient import Patient
from app.models.image import Image
from app.models.prediction import Prediction
from app.models.report import Report
from app.models.model_version import ModelVersion
from app.models.audit_log import AuditLog

__all__ = [
    "Base",
    "User",
    "Patient",
    "Image",
    "Prediction",
    "Report",
    "ModelVersion",
    "AuditLog"
]
