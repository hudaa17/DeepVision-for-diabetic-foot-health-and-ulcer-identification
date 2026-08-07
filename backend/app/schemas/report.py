import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReportCreateRequest(BaseModel):
    doctor_notes: Optional[str] = None

class ReportResponse(BaseModel):
    id: uuid.UUID
    prediction_id: uuid.UUID
    patient_id: uuid.UUID
    report_storage_key: str
    doctor_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
