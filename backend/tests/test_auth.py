import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.auth_service import auth_service
from app.schemas.user import UserCreate
from app.models.user import User

@pytest.mark.asyncio
async def test_register_user_success():
    # Arrange
    db_mock = AsyncMock()
    user_in = UserCreate(
        email="test_user@curavision.org",
        password="TestPassword123!",
        full_name="Test User",
        role="patient"
    )
    
    # Mock user repo methods
    from app.repositories.user import user_repo
    user_repo.get_by_email = AsyncMock(return_value=None)
    
    mock_created_user = User(
        id="c4e2da92-8048-4f92-9ec3-e035158c889c",
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=True
    )
    user_repo.create = AsyncMock(return_value=mock_created_user)
    
    # Act
    res = await auth_service.register_user(db_mock, user_in)
    
    # Assert
    assert res.email == "test_user@curavision.org"
    assert res.role == "patient"
    assert res.is_active is True
    user_repo.get_by_email.assert_called_once_with(db_mock, email=user_in.email)

@pytest.mark.asyncio
async def test_register_user_already_exists():
    # Arrange
    db_mock = AsyncMock()
    user_in = UserCreate(
        email="existing@curavision.org",
        password="TestPassword123!",
        full_name="Existing User",
        role="patient"
    )
    
    from app.repositories.user import user_repo
    user_repo.get_by_email = AsyncMock(return_value=User(email=user_in.email))
    
    # Act & Assert
    with pytest.raises(ValueError) as excinfo:
        await auth_service.register_user(db_mock, user_in)
    assert "already exists" in str(excinfo.value)

@pytest.mark.asyncio
async def test_authenticate_user_success():
    # Arrange
    db_mock = AsyncMock()
    email = "auth@curavision.org"
    password = "CorrectPassword123!"
    
    from app.core.security import get_password_hash
    hashed = get_password_hash(password)
    
    mock_user = User(
        id="c4e2da92-8048-4f92-9ec3-e035158c889d",
        email=email,
        hashed_password=hashed,
        role="clinician",
        is_active=True
    )
    
    from app.repositories.user import user_repo
    user_repo.get_by_email = AsyncMock(return_value=mock_user)
    
    # Act
    user = await auth_service.authenticate_user(db_mock, email, password)
    
    # Assert
    assert user is not None
    assert user.role == "clinician"
    assert user.email == email

@pytest.mark.asyncio
async def test_authenticate_user_wrong_password():
    # Arrange
    db_mock = AsyncMock()
    email = "auth@deepvision.org"
    password = "CorrectPassword123!"
    
    from app.core.security import get_password_hash
    hashed = get_password_hash(password)
    
    mock_user = User(
        id="c4e2da92-8048-4f92-9ec3-e035158c889d",
        email=email,
        hashed_password=hashed,
        role="clinician",
        is_active=True
    )
    
    from app.repositories.user import user_repo
    user_repo.get_by_email = AsyncMock(return_value=mock_user)
    
    # Act
    user = await auth_service.authenticate_user(db_mock, email, "WrongPassword!")
    
    # Assert
    assert user is None
