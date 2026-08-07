import uuid
from datetime import datetime, date
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class PatientBase(BaseModel):
    patient_code: str = Field(..., max_length=50)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=20)
    medical_history: Optional[Dict[str, Any]] = None

class PatientCreate(PatientBase):
    user_id: Optional[uuid.UUID] = None

class PatientUpdate(BaseModel):
    patient_code: Optional[str] = Field(None, max_length=50)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    phone: Optional[str] = Field(None, max_length=20)
    medical_history: Optional[Dict[str, Any]] = None
    user_id: Optional[uuid.UUID] = None

class PatientResponse(PatientBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
