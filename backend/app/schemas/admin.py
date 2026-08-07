import uuid
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, ConfigDict

class UserRoleUpdate(BaseModel):
    role: Literal["patient", "clinician", "admin"]

class ModelVersionCreate(BaseModel):
    version_string: str
    file_path: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    training_dataset_version: Optional[str] = None

class ModelVersionResponse(BaseModel):
    id: uuid.UUID
    version_string: str
    file_path: str
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    training_dataset_version: Optional[str] = None
    upload_date: datetime
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    action: str
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SystemMonitoringResponse(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_usage_percent: float
    active_connections: int
    db_status: str
    redis_status: str
