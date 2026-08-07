from datetime import timedelta, timezone, datetime
import jwt
import uuid
from typing import Any, Optional, Tuple, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import get_password_hash, verify_password
from app.core.jwt import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.repositories.user import user_repo
from app.schemas.user import UserCreate, Token
from app.services.redis_service import redis_service
from app.services.audit_service import audit_service

class AuthService:
    async def register_user(self, db: AsyncSession, user_in: UserCreate, ip: Optional[str] = None) -> User:
        """Register a new user in the system."""
        existing_user = await user_repo.get_by_email(db, email=user_in.email)
        if existing_user:
            raise ValueError("A user with this email address already exists.")
            
        hashed_password = get_password_hash(user_in.password)
        obj_in = {
            "email": user_in.email.lower().strip(),
            "hashed_password": hashed_password,
            "full_name": user_in.full_name,
            "role": user_in.role,
            "is_active": True
        }
        user = await user_repo.create(db, obj_in=obj_in)
        await audit_service.log_event(db, user.id, "user_registered", {"email": user.email, "role": user.role}, ip)
        return user

    async def authenticate_user(
        self, db: AsyncSession, email: str, password: str, ip: Optional[str] = None
    ) -> Optional[User]:
        """Authenticate a user by email and password."""
        user = await user_repo.get_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password) or not user.is_active:
            await audit_service.log_failed_login(db, email, ip)
            return None
            
        await audit_service.log_successful_login(db, user, ip)
        return user

    def generate_tokens(self, user: User) -> Token:
        """Create access and refresh tokens for a user session."""
        access_token = create_access_token(subject=user.id, role=user.role)
        refresh_token = create_refresh_token(subject=user.id)
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            role=user.role
        )

    async def logout_user(self, db: AsyncSession, user: User, token: str, payload: Dict[str, Any], ip: Optional[str] = None) -> None:
        """Blacklist the active access token JTI to invalidate the user session."""
        jti = payload.get("jti") or str(uuid.uuid4()) # If jti is not in token, use random
        exp = payload.get("exp")
        now = int(datetime.now(timezone.utc).timestamp())
        
        # Calculate time remaining until token naturally expires
        expire_seconds = max(exp - now, 60) if exp else settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        
        await redis_service.blacklist_token(jti, expire_seconds)
        await audit_service.log_logout(db, user, ip)

    async def refresh_session(self, db: AsyncSession, refresh_token: str) -> Token:
        """Issue a new access token using a valid refresh token."""
        try:
            payload = decode_token(refresh_token, is_refresh=True)
            if payload.get("type") != "refresh":
                raise jwt.PyJWTError("Invalid token type")
                
            user_id = payload.get("sub")
            if not user_id:
                raise jwt.PyJWTError("Subject missing from refresh token")
                
            user = await user_repo.get(db, uuid.UUID(user_id))
            if not user or not user.is_active:
                raise jwt.PyJWTError("User is inactive or deleted")
                
            return self.generate_tokens(user)
        except jwt.PyJWTError as e:
            raise ValueError(f"Invalid refresh token: {e}")

    async def request_password_reset(self, db: AsyncSession, email: str, ip: Optional[str] = None) -> str:
        """Generate a password reset token and return simulation url."""
        user = await user_repo.get_by_email(db, email=email)
        if not user:
            # Prevent enumeration attacks by returning success always
            return "ok"
            
        # Create single-use token expiring in 15 mins
        reset_token = create_access_token(subject=user.id, role=user.role, expires_delta=timedelta(minutes=15))
        await audit_service.log_event(db, user.id, "password_reset_request", {"email": email}, ip)
        
        # In a real environment, send an email. For demo/API output, we return it.
        return f"/api/v1/auth/reset-password?token={reset_token}"

    async def confirm_password_reset(self, db: AsyncSession, token: str, new_password: str, ip: Optional[str] = None) -> bool:
        """Validate reset token and update user password."""
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if not user_id:
                return False
                
            user = await user_repo.get(db, uuid.UUID(user_id))
            if not user or not user.is_active:
                return False
                
            hashed_password = get_password_hash(new_password)
            await user_repo.update(db, db_obj=user, obj_in={"hashed_password": hashed_password})
            await audit_service.log_event(db, user.id, "password_reset_complete", {}, ip)
            return True
        except jwt.PyJWTError:
            return False

auth_service = AuthService()
