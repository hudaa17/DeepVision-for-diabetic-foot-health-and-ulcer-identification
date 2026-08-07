from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.base import BaseRepository

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        """Retrieve a user by email address."""
        result = await db.execute(select(User).filter(User.email == email.lower().strip()))
        return result.scalars().first()

    async def count_active_users(self, db: AsyncSession) -> int:
        """Count the number of active users in the system."""
        result = await db.execute(select(func.count(User.id)).filter(User.is_active == True))
        return result.scalar() or 0

user_repo = UserRepository()
