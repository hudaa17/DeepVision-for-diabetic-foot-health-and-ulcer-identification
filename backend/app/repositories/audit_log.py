from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog
from app.repositories.base import BaseRepository
import uuid

class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self):
        super().__init__(AuditLog)

    async def get_recent_logs(self, db: AsyncSession, limit: int = 100) -> List[AuditLog]:
        """Fetch the most recent audit logs for administration monitoring."""
        result = await db.execute(
            select(AuditLog)
            .order_by(desc(AuditLog.created_at))
            .limit(limit)
        )
        return list(result.scalars().all())

    async def log_event(
        self, 
        db: AsyncSession, 
        user_id: Optional[uuid.UUID], 
        action: str, 
        details: Optional[dict] = None, 
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """Create and write a security audit log event to the database."""
        obj_in = {
            "user_id": user_id,
            "action": action,
            "details": details or {},
            "ip_address": ip_address
        }
        return await self.create(db, obj_in=obj_in)

audit_log_repo = AuditLogRepository()
