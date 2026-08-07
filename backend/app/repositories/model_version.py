from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.model_version import ModelVersion
from app.repositories.base import BaseRepository
import uuid

class ModelVersionRepository(BaseRepository[ModelVersion]):
    def __init__(self):
        super().__init__(ModelVersion)

    async def get_active_model(self, db: AsyncSession) -> Optional[ModelVersion]:
        """Fetch the currently active ML model from the registry."""
        result = await db.execute(select(ModelVersion).filter(ModelVersion.is_active == True))
        return result.scalars().first()

    async def set_active_model(self, db: AsyncSession, model_id: uuid.UUID) -> Optional[ModelVersion]:
        """Set a specific model version as active and deactivate all others."""
        # Deactivate all models
        await db.execute(
            update(ModelVersion)
            .values(is_active=False)
        )
        # Activate target model
        await db.execute(
            update(ModelVersion)
            .filter(ModelVersion.id == model_id)
            .values(is_active=True)
        )
        await db.commit()
        return await self.get(db, model_id)

    async def get_by_version(self, db: AsyncSession, version_string: str) -> Optional[ModelVersion]:
        """Fetch a model by its unique version identifier."""
        result = await db.execute(
            select(ModelVersion)
            .filter(ModelVersion.version_string == version_string.strip())
        )
        return result.scalars().first()

model_version_repo = ModelVersionRepository()
