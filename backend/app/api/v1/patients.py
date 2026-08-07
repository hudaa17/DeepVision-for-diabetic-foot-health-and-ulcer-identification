from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List, Optional
import uuid

from app.core.database import get_db
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services.patient_service import patient_service
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User

router = APIRouter(prefix="/patients", tags=["Patients"])

# RBAC dependencies
require_clinician_or_admin = RoleChecker(["clinician", "admin"])
require_admin_only = RoleChecker(["admin"])
require_any_authenticated = RoleChecker(["patient", "clinician", "admin"])

@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    request: Request,
    patient_in: PatientCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Create a new patient record (Clinician/Admin only)."""
    try:
        ip = request.client.host if request.client else None
        return await patient_service.create_patient(db, patient_in, current_user, ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("", response_model=List[PatientResponse])
async def list_patients(
    search_term: Optional[str] = Query(None, description="Search by code or phone"),
    gender: Optional[str] = Query(None, description="Filter by gender"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Search and paginate patient records (Clinician/Admin only)."""
    return await patient_service.list_patients(
        db, search_term=search_term, gender=gender, skip=skip, limit=limit
    )

@router.get("/{id}", response_model=PatientResponse)
async def get_patient(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Get details of a specific patient profile. Patients can access their own record."""
    patient = await patient_service.get_patient(db, id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")
        
    # Check authorization: Patients can only retrieve their own profile
    if current_user.role == "patient" and patient.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. You can only view your own profile."
        )
        
    return patient

@router.put("/{id}", response_model=PatientResponse)
async def update_patient(
    request: Request,
    id: uuid.UUID,
    patient_in: PatientUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Update a patient profile (Clinician/Admin only)."""
    ip = request.client.host if request.client else None
    patient = await patient_service.update_patient(db, id, patient_in, current_user, ip)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")
    return patient

@router.delete("/{id}", response_model=PatientResponse)
async def delete_patient(
    request: Request,
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin_only)
) -> Any:
    """Remove a patient profile from the system (Admin only)."""
    ip = request.client.host if request.client else None
    patient = await patient_service.delete_patient(db, id, current_user, ip)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found.")
    return patient
