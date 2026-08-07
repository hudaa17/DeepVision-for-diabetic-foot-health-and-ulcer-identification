import os
import uuid
import psutil
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.model_version import ModelVersion
from app.models.user import User
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.repositories.model_version import model_version_repo
from app.repositories.user import user_repo
from app.repositories.audit_log import audit_log_repo
from app.services.audit_service import audit_service
from app.services.storage import storage_service
from app.ml.mobilenet import model_runner
import logging

logger = logging.getLogger(__name__)

class AdminService:
    async def get_system_metrics(self, db: AsyncSession) -> Dict[str, Any]:
        """Fetch system-level usage metrics and service health states."""
        # 1. System stats using psutil
        cpu = psutil.cpu_percent(interval=None)
        memory = psutil.virtual_memory().percent
        disk = psutil.disk_usage("/").percent

        # 2. Database connection status check
        db_status = "healthy"
        try:
            await db.execute(select(func.now()))
        except Exception as e:
            logger.error(f"DB monitoring health check failed: {e}")
            db_status = "unhealthy"

        # 3. Redis status check
        redis_status = "healthy"
        from app.services.redis_service import redis_service
        if not redis_service.is_connected:
            redis_status = "unhealthy"

        # 4. Total active user connections (can be count of unique recent log activities)
        # For simplicity, count total user records in system
        user_count = await user_repo.count_active_users(db)

        return {
            "cpu_percent": cpu,
            "memory_percent": memory,
            "disk_usage_percent": disk,
            "active_connections": user_count,
            "db_status": db_status,
            "redis_status": redis_status
        }

    async def register_dataset_upload(
        self, db: AsyncSession, filename: str, file_bytes: bytes, uploader: User, ip: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process and archive dataset packages uploaded for training."""
        if not filename.endswith(".zip"):
            raise ValueError("Only datasets packaged in .zip archives are supported.")
            
        # Store dataset file in storage backend
        dataset_id = uuid.uuid4()
        storage_key = f"datasets/{dataset_id}_{filename}"
        
        await storage_service.upload_file(
            file_data=file_bytes,
            storage_key=storage_key,
            content_type="application/zip"
        )
        
        # Log action in audit trail
        await audit_service.log_admin_action(
            db, 
            uploader, 
            "dataset_upload", 
            {"filename": filename, "dataset_id": str(dataset_id), "size_bytes": len(file_bytes)},
            ip
        )
        
        return {
            "dataset_id": str(dataset_id),
            "filename": filename,
            "storage_key": storage_key,
            "status": "archived_successfully"
        }

    async def trigger_model_retraining(
        self, db: AsyncSession, dataset_version: str, uploader: User, ip: Optional[str] = None
    ) -> ModelVersion:
        """
        Simulate training execution, produce validation scores, and register a new Active Model.
        """
        logger.info(f"Triggering model training on dataset version: {dataset_version}")
        
        # 1. Simulating deep learning training epochs
        # In production, this would trigger a celery task/subprocess with TensorFlow fit()
        # We simulate the metrics:
        import random
        acc = round(random.uniform(0.92, 0.98), 4)
        prec = round(acc - random.uniform(0.01, 0.03), 4)
        rec = round(acc + random.uniform(0.01, 0.02), 4)
        f1 = round(2 * (prec * rec) / (prec + rec), 4)
        
        new_version_str = f"v_mobilenet_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # We copy the active model or keep the file path
        # In a real pipeline, the new model file would be saved on disk
        model_runner.load()
        trained_weights_path = model_runner.model_path

        # 2. Insert Model Version in Registry
        obj_in = {
            "version_string": new_version_str,
            "file_path": trained_weights_path,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "training_dataset_version": dataset_version,
            "is_active": False
        }
        
        # Save model record
        model_ver = await model_version_repo.create(db, obj_in=obj_in)
        
        # 3. Promote this model version to active
        await model_version_repo.set_active_model(db, model_ver.id)
        
        # 4. Refresh Model Runner to use new version
        model_runner.model = None  # Force reload on next predict
        
        await audit_service.log_admin_action(
            db, 
            uploader, 
            "model_retraining", 
            {
                "new_version": new_version_str, 
                "metrics": {"accuracy": acc, "precision": prec, "recall": rec, "f1_score": f1},
                "dataset_version": dataset_version
            },
            ip
        )
        
        return model_ver

    async def stream_audit_logs(self, db: AsyncSession, limit: int = 100) -> List[Any]:
        """Fetch audit log records for monitoring logs UI."""
        return await audit_log_repo.get_recent_logs(db, limit=limit)

admin_service = AdminService()
