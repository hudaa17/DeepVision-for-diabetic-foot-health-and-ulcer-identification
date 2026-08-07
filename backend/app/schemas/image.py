import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class ImageBase(BaseModel):
    patient_id: uuid.UUID
    original_filename: Optional[str] = None
    file_size: Optional[int] = None
    content_type: Optional[str] = None

class ImageResponse(ImageBase):
    id: uuid.UUID
    uploader_id: Optional[uuid.UUID] = None
    storage_key: str
    is_processed: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ImageUploadResponse(BaseModel):
    message: str
    image: ImageResponse
