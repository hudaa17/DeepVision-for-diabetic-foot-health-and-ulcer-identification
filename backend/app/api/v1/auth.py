from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, Token, LoginRequest, TokenRefreshRequest, PasswordResetRequest, PasswordResetConfirm
from app.services.auth_service import auth_service
from app.api.deps import get_current_user
from app.core.jwt import decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_in: UserCreate, 
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Register a new user account (default role: patient)."""
    try:
        ip = request.client.host if request.client else None
        return await auth_service.register_user(db, user_in=user_in, ip=ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
) -> Any:
    """OAuth2 password flow login yielding access and refresh tokens."""
    ip = request.client.host if request.client else None
    user = await auth_service.authenticate_user(
        db, email=form_data.username, password=form_data.password, ip=ip
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.generate_tokens(user)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    request: Request,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")),
    current_user: Any = Depends(get_current_user)
) -> Any:
    """Logout the current user, blacklisting their session token in Redis."""
    ip = request.client.host if request.client else None
    try:
        # Decode to get exp and jti
        payload = decode_token(token)
        await auth_service.logout_user(db, current_user, token, payload, ip)
        return {"message": "Successfully logged out"}
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

@router.post("/refresh", response_model=Token)
async def refresh(
    refresh_in: TokenRefreshRequest, 
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Issue new credentials using a refresh token."""
    try:
        return await auth_service.refresh_session(db, refresh_in.refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: Any = Depends(get_current_user)) -> Any:
    """Retrieve profile details of the logged in user."""
    return current_user

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: Request,
    reset_in: PasswordResetRequest,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Trigger a password reset link sequence for the email user."""
    ip = request.client.host if request.client else None
    reset_url = await auth_service.request_password_reset(db, email=reset_in.email, ip=ip)
    return {"message": "If the email exists, a password reset link has been generated.", "reset_url": reset_url}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request: Request,
    confirm_in: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Reset user password using token verification."""
    ip = request.client.host if request.client else None
    success = await auth_service.confirm_password_reset(
        db, token=confirm_in.token, new_password=confirm_in.new_password, ip=ip
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password reset failed. Token is invalid or expired.")
    return {"message": "Password reset successful"}
