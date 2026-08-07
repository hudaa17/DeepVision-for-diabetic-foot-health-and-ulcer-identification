import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict

class PredictionBase(BaseModel):
    image_id: uuid.UUID
    patient_id: uuid.UUID

class PredictionResponse(PredictionBase):
    id: uuid.UUID
    model_version_id: Optional[uuid.UUID] = None
    risk_level: Optional[str] = None # normal, mild, severe
    confidence_score: Optional[float] = None
    probability_normal: Optional[float] = None
    probability_mild: Optional[float] = None
    probability_severe: Optional[float] = None
    heatmap_storage_key: Optional[str] = None
    recommendations: Optional[Dict[str, Any]] = None
    status: str # pending, processing, completed, failed
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PredictionStatusResponse(BaseModel):
    id: uuid.UUID
    status: str
    risk_level: Optional[str] = None
    confidence_score: Optional[float] = None
