from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Any
import uuid

from app.core.database import get_db
from app.schemas.report import ReportResponse, ReportCreateRequest
from app.services.report_service import report_service
from app.services.storage import storage_service
from app.api.deps import RoleChecker, get_current_user
from app.models.user import User
from app.models.patient import Patient

router = APIRouter(prefix="/reports", tags=["Reports"])

# RBAC permissions
require_clinician_or_admin = RoleChecker(["clinician", "admin"])
require_any_authenticated = RoleChecker(["patient", "clinician", "admin"])

@router.post("/{prediction_id}", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def generate_report(
    prediction_id: uuid.UUID,
    notes_in: ReportCreateRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_clinician_or_admin)
) -> Any:
    """Generate a clinical PDF report for a prediction (Clinician/Admin only)."""
    try:
        ip = request.client.host if request.client else None
        return await report_service.generate_pdf_report(
            db=db,
            prediction_id=prediction_id,
            doctor_notes=notes_in.doctor_notes,
            current_user=current_user,
            ip=ip
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate report: {e}")

@router.get("/{prediction_id}", response_model=ReportResponse)
async def get_report_metadata(
    prediction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Fetch report database record by prediction ID."""
    report = await report_service.get_report_by_prediction(db, prediction_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found for this prediction.")
        
    # Check authorization: Patients can only view their own reports
    if current_user.role == "patient":
        pat_result = await db.execute(select(Patient).filter(Patient.id == report.patient_id))
        patient = pat_result.scalars().first()
        if not patient or patient.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied. You can only view your own reports."
            )
            
    return report

@router.get("/download/{prediction_id}")
async def download_report_pdf(
    prediction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_any_authenticated)
) -> Any:
    """Download the clinical assessment PDF report file."""
    report = await report_service.get_report_by_prediction(db, prediction_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found for this prediction.")
        
    # Check authorization: Patients can only download their own reports
    if current_user.role == "patient":
        pat_result = await db.execute(select(Patient).filter(Patient.id == report.patient_id))
        patient = pat_result.scalars().first()
        if not patient or patient.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Access denied. You can only download your own reports."
            )
            
    try:
        pdf_data = await storage_service.download_file(report.report_storage_key)
        filename = f"diabetic_foot_report_{prediction_id}.pdf"
        return Response(
            content=pdf_data, 
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error downloading PDF file: {e}")
