from typing import Optional, Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.audit_log import audit_log_repo
from app.models.user import User
import uuid
import logging

logger = logging.getLogger(__name__)

class AuditService:
    async def log_event(
        self,
        db: AsyncSession,
        user_id: Optional[uuid.UUID],
        action: str,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> None:
        """Asynchronously record an audit log in the database."""
        try:
            await audit_log_repo.log_event(
                db=db,
                user_id=user_id,
                action=action,
                details=details,
                ip_address=ip_address
            )
            # Log in JSON structured format as well
            logger.info(f"Audit event: {action}", extra={"extra_context": {
                "user_id": str(user_id) if user_id else "anonymous",
                "action": action,
                "details": details,
                "ip_address": ip_address
            }})
        except Exception as e:
            logger.error(f"Failed to save audit log to DB: {e}", exc_info=True)

    async def log_successful_login(self, db: AsyncSession, user: User, ip: Optional[str]) -> None:
        await self.log_event(db, user.id, "login_success", {"email": user.email, "role": user.role}, ip)

    async def log_failed_login(self, db: AsyncSession, email: str, ip: Optional[str]) -> None:
        await self.log_event(db, None, "login_failed", {"attempted_email": email}, ip)

    async def log_logout(self, db: AsyncSession, user: User, ip: Optional[str]) -> None:
        await self.log_event(db, user.id, "logout", {"email": user.email}, ip)

    async def log_patient_crud(self, db: AsyncSession, user: User, patient_id: uuid.UUID, action: str, details: Dict[str, Any], ip: Optional[str]) -> None:
        details["patient_id"] = str(patient_id)
        await self.log_event(db, user.id, f"patient_{action}", details, ip)

    async def log_prediction_request(self, db: AsyncSession, user: User, patient_id: uuid.UUID, image_id: uuid.UUID, prediction_id: uuid.UUID, ip: Optional[str]) -> None:
        details = {
            "patient_id": str(patient_id),
            "image_id": str(image_id),
            "prediction_id": str(prediction_id)
        }
        await self.log_event(db, user.id, "prediction_requested", details, ip)

    async def log_report_download(self, db: AsyncSession, user: User, prediction_id: uuid.UUID, report_id: uuid.UUID, ip: Optional[str]) -> None:
        details = {
            "prediction_id": str(prediction_id),
            "report_id": str(report_id)
        }
        await self.log_event(db, user.id, "report_downloaded", details, ip)

    async def log_admin_action(self, db: AsyncSession, user: User, action: str, details: Dict[str, Any], ip: Optional[str]) -> None:
        await self.log_event(db, user.id, f"admin_{action}", details, ip)

audit_service = AuditService()
