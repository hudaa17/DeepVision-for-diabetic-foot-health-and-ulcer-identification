from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any, List
import uuid

from app.core.database import get_db
from app.schemas.dashboard import DashboardStats, RiskDistribution, MonthlyTrendItem, PatientDashboardResponse
from app.services.redis_service import redis_service
from app.repositories.patient import patient_repo
from app.repositories.prediction import prediction_repo
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User
from app.ml.recommendation import get_recommendations_for_risk

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# RBAC permissions
require_clinician_or_admin = RoleChecker(["clinician", "admin"])
require_patient_only = RoleChecker(["patient"])
require_any_authenticated = RoleChecker(["patient", "clinician", "admin"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Retrieve aggregated stats for clinician/admin dashboards. Results are cached in Redis for 5 minutes."""
    cache_key = "dashboard:stats"
    
    # Try reading from cache
    cached_stats = await redis_service.get_cache(cache_key)
    if cached_stats:
        return cached_stats
        
    # Calculate stats since they are not cached
    # 1. Total Patients
    total_patients_res = await db.execute(select(func.count(Patient.id)))
    total_patients = total_patients_res.scalar() or 0
    
    # 2. Total Predictions
    total_preds_res = await db.execute(select(func.count(Prediction.id)).filter(Prediction.status == "completed"))
    total_preds = total_preds_res.scalar() or 0
    
    # 3. Risk distribution
    risk_counts = await prediction_repo.get_stats_by_risk(db)
    distribution = RiskDistribution(
        normal=risk_counts.get("normal", 0),
        mild=risk_counts.get("mild", 0),
        severe=risk_counts.get("severe", 0)
    )
    
    # 4. Monthly trends
    trends_raw = await prediction_repo.get_monthly_trends(db)
    monthly_trends = [MonthlyTrendItem(month=t["month"], count=t["count"]) for t in trends_raw]
    
    # 5. Recent predictions
    recent_preds = await prediction_repo.get_recent_predictions(db, limit=5)
    
    # Bundle result
    stats_data = DashboardStats(
        total_patients=total_patients,
        total_predictions=total_preds,
        risk_distribution=distribution,
        monthly_trends=monthly_trends,
        recent_predictions=recent_preds
    )
    
    # Cache for 5 minutes (300 seconds)
    # Pydantic v2 dump
    await redis_service.set_cache(cache_key, stats_data.model_dump(mode='json'), expire_seconds=300)
    
    return stats_data

@router.get("/history", response_model=PatientDashboardResponse)
async def get_patient_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_patient_only)
) -> Any:
    """Retrieve prediction history and recommendations for the logged-in patient."""
    # Find patient record corresponding to the user ID
    pat_res = await db.execute(select(Patient).filter(Patient.user_id == current_user.id))
    patient = pat_res.scalars().first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Patient profile not found for this user account. Contact administration."
        )
        
    # Get prediction history
    history = await prediction_repo.get_by_patient(db, patient.id, limit=50)
    
    # Find latest completed prediction to extract current risk and guidelines
    current_risk = None
    latest_recs = None
    
    completed_preds = [p for p in history if p.status == "completed"]
    if completed_preds:
        latest_pred = completed_preds[0]
        current_risk = latest_pred.risk_level
        latest_recs = latest_pred.recommendations

    return PatientDashboardResponse(
        patient_id=str(patient.id),
        prediction_history=history,
        current_risk_level=current_risk,
        latest_recommendations=latest_recs
    )

@router.get("")
async def get_dashboard_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Helpful endpoint to route users to the appropriate stats/history dashboard depending on role."""
    if current_user.role == "patient":
        return await get_patient_dashboard(db, current_user)
    else:
        return await get_dashboard_statistics(db, current_user)
