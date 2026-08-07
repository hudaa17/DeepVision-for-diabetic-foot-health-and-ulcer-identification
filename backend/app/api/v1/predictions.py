from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Any, List, Optional
import uuid

from app.core.database import get_db
from app.schemas.prediction import PredictionResponse, PredictionStatusResponse
from app.services.prediction_service import prediction_service
from app.services.redis_service import redis_service
from app.services.storage import storage_service
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User
from app.models.prediction import Prediction
from app.models.patient import Patient

router = APIRouter(prefix="", tags=["Predictions"]) # Let's prefix with empty so we map both /predict and /predictions

# RBAC permissions
require_clinician_or_admin = RoleChecker(["clinician", "admin"])
require_any_authenticated = RoleChecker(["patient", "clinician", "admin"])

@router.post("/predict/{image_id}", response_model=PredictionResponse, status_code=status.HTTP_202_ACCEPTED)
async def run_prediction(
    image_id: uuid.UUID,
    patient_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Trigger background diabetic foot ulcer risk prediction for an image (Clinician/Admin only)."""
    try:
        ip = request.client.host if request.client else None
        prediction = await prediction_service.create_prediction_task(
            db=db,
            image_id=image_id,
            patient_id=patient_id,
            uploader_user=current_user,
            background_tasks=background_tasks,
            ip=ip
        )
        return prediction
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction request failed: {e}")

@router.get("/predictions/status/{id}", response_model=PredictionStatusResponse)
async def get_prediction_status(
    id: uuid.UUID,
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Retrieve temporary running prediction logs/progress from Redis cache."""
    status_data = await redis_service.get_prediction_status(str(id))
    if not status_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Prediction task status not found or expired. Use prediction details endpoint instead."
        )
    return status_data

@router.get("/predictions/{id}", response_model=PredictionResponse)
async def get_prediction(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Retrieve complete prediction classification results and recommendations."""
    prediction = await prediction_service.get_prediction(db, id)
    if not prediction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction not found.")
        
    # Check authorization: Patients can only retrieve their own predictions
    if current_user.role == "patient":
        pat_result = await db.execute(select(Patient).filter(Patient.id == prediction.patient_id))
        patient = pat_result.scalars().first()
        if not patient or patient.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied. You can only view your own predictions."
            )
            
    return prediction

@router.get("/predictions", response_model=List[PredictionResponse])
async def list_predictions(
    patient_id: Optional[uuid.UUID] = Query(None, description="Filter predictions by patient UUID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """List and paginate prediction history."""
    if current_user.role == "patient":
        # Patients can only list their own predictions
        pat_result = await db.execute(select(Patient).filter(Patient.user_id == current_user.id))
        patient = pat_result.scalars().first()
        if not patient:
            return []
        patient_id = patient.id

    if patient_id:
        return await prediction_service.list_patient_history(db, patient_id, skip=skip, limit=limit)
    else:
        # Clinicians/Admins can list all predictions
        if current_user.role == "patient":
            return []
        result = await db.execute(
            select(Prediction)
            .order_by(desc(Prediction.created_at))
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

@router.delete("/predictions/{id}", status_code=status.HTTP_200_OK)
async def delete_prediction(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Delete a prediction record and its generated assets (Clinician/Admin only)."""
    success = await prediction_service.delete_prediction(db, id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found.")
    return {"message": "Prediction deleted successfully"}

# Local Storage Asset serving endpoint
@router.get("/predictions/files/{key:path}")
async def serve_file(
    key: str,
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Serve local static assets (images, heatmaps, reports) securely from the local uploads folder."""
    try:
        file_data = await storage_service.download_file(key)
        media_type = "image/png"
        if key.endswith(".pdf"):
            media_type = "application/pdf"
        elif key.endswith(".jpg") or key.endswith(".jpeg"):
            media_type = "image/jpeg"
            
        return Response(content=file_data, media_type=media_type)
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File asset not found in storage.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
