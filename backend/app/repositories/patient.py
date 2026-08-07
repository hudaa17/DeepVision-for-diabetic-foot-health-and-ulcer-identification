from typing import List, Optional
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.patient import Patient
from app.repositories.base import BaseRepository

class PatientRepository(BaseRepository[Patient]):
    def __init__(self):
        super().__init__(Patient)

    async def get_by_code(self, db: AsyncSession, patient_code: str) -> Optional[Patient]:
        """Retrieve a patient by their unique patient code."""
        result = await db.execute(select(Patient).filter(Patient.patient_code == patient_code.strip()))
        return result.scalars().first()

    async def search_patients(
        self, 
        db: AsyncSession, 
        *, 
        search_term: Optional[str] = None, 
        gender: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Patient]:
        """Search and filter patients with pagination."""
        query = select(Patient)
        
        filters = []
        if search_term:
            search_pattern = f"%{search_term.strip()}%"
            filters.append(
                or_(
                    Patient.patient_code.ilike(search_pattern),
                    Patient.phone.ilike(search_pattern)
                )
            )
            
        if gender:
            filters.append(Patient.gender == gender)
            
        if filters:
            query = query.filter(*filters)
            
        result = await db.execute(query.offset(skip).limit(limit))
        return list(result.scalars().all())

patient_repo = PatientRepository()
