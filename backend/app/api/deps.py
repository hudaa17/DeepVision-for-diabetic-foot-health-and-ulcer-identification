import uuid
from typing import List, Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt

from app.core.config import settings
from app.core.database import get_db
from app.core.jwt import decode_token
from app.models.user import User
from app.repositories.user import user_repo
from app.services.redis_service import redis_service

from sqlalchemy.ext.asyncio import AsyncSession

# Define oauth2 security scheme pointing to our login route
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """Validate access token and retrieve current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode and validate token type
        payload = decode_token(token)
        user_id = payload.get("sub")
        jti = payload.get("jti")
        token_type = payload.get("type")
        
        if not user_id or token_type != "access":
            raise credentials_exception
            
        # Check if token JTI is blacklisted in Redis
        if jti and await redis_service.is_token_blacklisted(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked/logged out."
            )
            
        user = await user_repo.get(db, uuid.UUID(user_id))
        if not user or not user.is_active:
            raise credentials_exception
            
        # Attach token payload to request state (accessed inside endpoint if needed)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credentials_exception

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """Enforce Role Based Access Control constraints."""
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden. Required role(s): {self.allowed_roles}"
            )
        return current_user
