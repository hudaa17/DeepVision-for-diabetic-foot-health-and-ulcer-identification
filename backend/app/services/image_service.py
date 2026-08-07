import uuid
from io import BytesIO
from typing import Optional
from PIL import Image as PILImage
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.image import Image
from app.models.user import User
from app.services.storage import storage_service
import logging

logger = logging.getLogger(__name__)

class ImageService:
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"}

    async def upload_patient_image(
        self, 
        db: AsyncSession, 
        patient_id: uuid.UUID, 
        uploader: User, 
        file_bytes: bytes, 
        filename: str, 
        content_type: str
    ) -> Image:
        """Validate, process, and upload a patient foot image to storage."""
        # 1. Size Validation
        if len(file_bytes) > self.MAX_FILE_SIZE:
            raise ValueError("File size exceeds the maximum limit of 5MB.")
            
        # 2. MIME Type Validation
        if content_type.lower() not in self.ALLOWED_TYPES:
            raise ValueError("Unsupported image type. Only JPG, JPEG, and PNG are allowed.")

        # 3. Content Integrity Validation (Open with PIL to ensure it is not corrupt)
        try:
            pil_image = PILImage.open(BytesIO(file_bytes))
            pil_image.verify()
            
            # Re-open for actual processing since verify() closes the stream
            pil_image = PILImage.open(BytesIO(file_bytes))
        except Exception as e:
            logger.error(f"Image integrity check failed: {e}")
            raise ValueError("Invalid image file. File content is corrupt or unreadable.")

        # 4. Optional Preprocessing / Compression
        # If dimensions are too large, resize to save bandwidth/storage while keeping aspect ratio
        max_dim = 1200
        if pil_image.width > max_dim or pil_image.height > max_dim:
            pil_image.thumbnail((max_dim, max_dim))
            # Convert to bytes
            out_bytes_io = BytesIO()
            # Save in original format if possible, otherwise JPEG
            save_format = pil_image.format if pil_image.format else "JPEG"
            pil_image.save(out_bytes_io, format=save_format, quality=85)
            file_bytes = out_bytes_io.getvalue()

        # 5. Upload via Storage Service
        file_ext = filename.split(".")[-1] if "." in filename else "jpg"
        storage_key = f"images/{patient_id}/{uuid.uuid4()}.{file_ext}"
        
        uploaded_key = await storage_service.upload_file(
            file_data=file_bytes,
            storage_key=storage_key,
            content_type=content_type
        )

        # 6. Save DB Metadata
        db_image = Image(
            patient_id=patient_id,
            uploader_id=uploader.id,
            storage_key=uploaded_key,
            original_filename=filename,
            file_size=len(file_bytes),
            content_type=content_type,
            is_processed=False
        )
        db.add(db_image)
        await db.commit()
        await db.refresh(db_image)

        return db_image

    async def get_image(self, db: AsyncSession, image_id: uuid.UUID) -> Optional[Image]:
        """Fetch image metadata by ID."""
        result = await db.execute(select(Image).filter(Image.id == image_id))
        return result.scalars().first()

    async def delete_image(self, db: AsyncSession, image_id: uuid.UUID) -> bool:
        """Delete image metadata and its file from storage."""
        result = await db.execute(select(Image).filter(Image.id == image_id))
        db_image = result.scalars().first()
        if not db_image:
            return False
            
        # Delete from storage
        await storage_service.delete_file(db_image.storage_key)
        
        # Delete from DB
        await db.delete(db_image)
        await db.commit()
        return True

image_service = ImageService()
