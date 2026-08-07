from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Any, List
import uuid

from app.core.database import get_db
from app.schemas.user import UserResponse
from app.schemas.admin import UserRoleUpdate, ModelVersionResponse, AuditLogResponse, SystemMonitoringResponse
from app.services.admin_service import admin_service
from app.services.audit_service import audit_service
from app.api.deps import RoleChecker
from app.models.user import User
from app.repositories.user import user_repo

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

# RBAC permissions: Admins only
require_admin_only = RoleChecker(["admin"])

@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Retrieve lists of all user accounts registered in the system (Admin only)."""
    return await user_repo.get_multi(db, skip=skip, limit=limit)

@router.put("/users/{id}", response_model=UserResponse)
async def update_user_role(
    id: uuid.UUID,
    role_in: UserRoleUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Promote or demote user roles (Admin only)."""
    user = await user_repo.get(db, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    old_role = user.role
    user.role = role_in.role
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    ip = request.client.host if request.client else None
    await audit_service.log_admin_action(
        db, current_user, "user_role_updated", {"target_user_id": str(id), "old_role": old_role, "new_role": role_in.role}, ip
    )
    return user

@router.delete("/users/{id}", response_model=UserResponse)
async def deactivate_user(
    id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Deactivate a user account (Admin only)."""
    user = await user_repo.get(db, id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        
    user.is_active = False
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    ip = request.client.host if request.client else None
    await audit_service.log_admin_action(
        db, current_user, "user_deactivated", {"target_user_id": str(id)}, ip
    )
    return user

@router.post("/dataset")
async def upload_dataset(
    request: Request,
    file: UploadFile = File(..., description="ZIP archive of images and CSV metadata"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Upload new diagnostic image datasets for model retraining (Admin only)."""
    try:
        file_bytes = await file.read()
        ip = request.client.host if request.client else None
        res = await admin_service.register_dataset_upload(
            db=db,
            filename=file.filename or "dataset.zip",
            file_bytes=file_bytes,
            uploader=current_user,
            ip=ip
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/retrain", response_model=ModelVersionResponse)
async def trigger_model_retraining(
    request: Request,
    dataset_version: str = Form(..., description="Version tag of the dataset to train on"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Simulate retraining the MobileNetV2 network, publishing validation scores and activating the new model (Admin only)."""
    try:
        ip = request.client.host if request.client else None
        return await admin_service.trigger_model_retraining(db, dataset_version, current_user, ip)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Retraining failed: {e}")

@router.get("/logs", response_model=List[AuditLogResponse])
async def get_system_audit_logs(
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Fetch system-wide audit logs for security tracking (Admin only)."""
    return await admin_service.stream_audit_logs(db, limit=limit)

@router.get("/monitoring", response_model=SystemMonitoringResponse)
async def get_system_resource_monitoring(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Check performance status, DB connectivity, Redis health, CPU, RAM, and disk utilization (Admin only)."""
    try:
        return await admin_service.get_system_metrics(db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Metrics check failed: {e}")
