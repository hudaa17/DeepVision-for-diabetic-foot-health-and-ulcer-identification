import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.patient import Patient
from app.models.user import User
from app.repositories.patient import patient_repo
from app.schemas.patient import PatientCreate, PatientUpdate
from app.services.audit_service import audit_service

class PatientService:
    async def create_patient(
        self, db: AsyncSession, patient_in: PatientCreate, current_user: User, ip: Optional[str] = None
    ) -> Patient:
        """Create a new patient profile and write audits."""
        # Check if patient code already exists
        existing = await patient_repo.get_by_code(db, patient_in.patient_code)
        if existing:
            raise ValueError(f"Patient with code '{patient_in.patient_code}' already exists.")
            
        obj_in = patient_in.model_dump()
        patient = await patient_repo.create(db, obj_in=obj_in)
        
        await audit_service.log_patient_crud(
            db, current_user, patient.id, "created", {"patient_code": patient.patient_code}, ip
        )
        return patient

    async def get_patient(self, db: AsyncSession, patient_id: uuid.UUID) -> Optional[Patient]:
        """Retrieve a patient profile by ID."""
        return await patient_repo.get(db, patient_id)

    async def get_patient_by_code(self, db: AsyncSession, patient_code: str) -> Optional[Patient]:
        """Retrieve a patient profile by unique patient code."""
        return await patient_repo.get_by_code(db, patient_code)

    async def update_patient(
        self, db: AsyncSession, patient_id: uuid.UUID, patient_in: PatientUpdate, current_user: User, ip: Optional[str] = None
    ) -> Optional[Patient]:
        """Update fields in a patient profile."""
        patient = await patient_repo.get(db, patient_id)
        if not patient:
            return None
            
        obj_in = patient_in.model_dump(exclude_unset=True)
        updated_patient = await patient_repo.update(db, db_obj=patient, obj_in=obj_in)
        
        await audit_service.log_patient_crud(
            db, current_user, patient_id, "updated", {"patient_code": updated_patient.patient_code}, ip
        )
        return updated_patient

    async def delete_patient(
        self, db: AsyncSession, patient_id: uuid.UUID, current_user: User, ip: Optional[str] = None
    ) -> Optional[Patient]:
        """Remove a patient profile from the system."""
        patient = await patient_repo.get(db, patient_id)
        if not patient:
            return None
            
        await patient_repo.remove(db, id=patient_id)
        
        await audit_service.log_patient_crud(
            db, current_user, patient_id, "deleted", {"patient_code": patient.patient_code}, ip
        )
        return patient

    async def list_patients(
        self, 
        db: AsyncSession, 
        search_term: Optional[str] = None, 
        gender: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Patient]:
        """Search and list patients using specified filters."""
        return await patient_repo.search_patients(db, search_term=search_term, gender=gender, skip=skip, limit=limit)

patient_service = PatientService()
