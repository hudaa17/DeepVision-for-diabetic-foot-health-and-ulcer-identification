from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid

from app.core.database import get_db
from app.schemas.image import ImageResponse, ImageUploadResponse
from app.services.image_service import image_service
from app.services.storage import storage_service
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User

router = APIRouter(prefix="/images", tags=["Images"])

# RBAC permissions
require_clinician_or_admin = RoleChecker(["clinician", "admin"])
require_any_authenticated = RoleChecker(["patient", "clinician", "admin"])

@router.post("/upload", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    patient_id: uuid.UUID = Form(..., description="The patient UUID this image belongs to"),
    file: UploadFile = File(..., description="The foot image file (JPG or PNG)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Upload a foot clinical image for a specific patient (Clinician/Admin only)."""
    try:
        file_bytes = await file.read()
        db_image = await image_service.upload_patient_image(
            db=db,
            patient_id=patient_id,
            uploader=current_user,
            file_bytes=file_bytes,
            filename=file.filename or "upload.jpg",
            content_type=file.content_type or "image/jpeg"
        )
        return {
            "message": "Image uploaded successfully.",
            "image": db_image
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Image upload failed: {e}")

@router.get("/{id}", response_model=ImageResponse)
async def get_image_metadata(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Retrieve metadata of an uploaded image."""
    image = await image_service.get_image(db, id)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image record not found.")
    return image

@router.get("/{id}/file")
async def get_image_file(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Serve the raw image file from the storage manager (Local/S3/Azure)."""
    image = await image_service.get_image(db, id)
    if not image:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image record not found.")
        
    try:
        file_data = await storage_service.download_file(image.storage_key)
        return Response(content=file_data, media_type=image.content_type or "image/jpeg")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not retrieve file: {e}")

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_image(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Delete an image record and its backing storage file (Clinician/Admin only)."""
    success = await image_service.delete_image(db, id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image record not found.")
    return {"message": "Image deleted successfully"}
