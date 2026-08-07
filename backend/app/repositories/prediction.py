from typing import List, Dict, Any
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.prediction import Prediction
from app.repositories.base import BaseRepository
import uuid

class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self):
        super().__init__(Prediction)

    async def get_by_patient(
        self, db: AsyncSession, patient_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Prediction]:
        """Retrieve prediction history for a specific patient."""
        result = await db.execute(
            select(Prediction)
            .filter(Prediction.patient_id == patient_id)
            .order_by(desc(Prediction.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_recent_predictions(self, db: AsyncSession, limit: int = 10) -> List[Prediction]:
        """Fetch the most recent predictions across the platform."""
        result = await db.execute(
            select(Prediction)
            .order_by(desc(Prediction.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_stats_by_risk(self, db: AsyncSession) -> Dict[str, int]:
        """Calculate counts grouped by risk level (Normal, Mild, Severe)."""
        result = await db.execute(
            select(Prediction.risk_level, func.count(Prediction.id))
            .filter(Prediction.status == "completed")
            .group_by(Prediction.risk_level)
        )
        stats = {row[0]: row[1] for row in result.all() if row[0] is not None}
        # Guarantee keys exist
        for k in ["normal", "mild", "severe"]:
            stats.setdefault(k, 0)
        return stats

    async def get_monthly_trends(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """Calculate month-on-month prediction counts."""
        # For Postgres compatibility, use date_trunc
        month_trunc = func.date_trunc('month', Prediction.created_at)
        result = await db.execute(
            select(month_trunc, func.count(Prediction.id))
            .filter(Prediction.status == "completed")
            .group_by(month_trunc)
            .order_by(month_trunc)
        )
        
        trends = []
        for row in result.all():
            if row[0]:
                trends.append({
                    "month": row[0].strftime("%Y-%m"),
                    "count": row[1]
                })
        return trends

prediction_repo = PredictionRepository()
