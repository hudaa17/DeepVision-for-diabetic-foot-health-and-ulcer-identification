import os
from typing import Optional, Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, EmailStr

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_NAME: str = "Diabetic Foot Risk Assessment System Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgrespassword@localhost:5432/diabetic_foot"
    )
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # Security Configuration
    JWT_SECRET_KEY: str = Field(default="dev_jwt_secret_key_change_me_in_production_12345")
    JWT_REFRESH_SECRET_KEY: str = Field(default="dev_jwt_refresh_secret_key_change_me_in_production_12345")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Initial Admin Credentials (seeded on startup)
    INITIAL_ADMIN_EMAIL: EmailStr = Field(default="admin@curavision.org")
    INITIAL_ADMIN_PASSWORD: str = Field(default="AdminSecure123!")

    # Storage Configuration
    STORAGE_PROVIDER: Literal["local", "s3", "azure"] = "local"

    # Local Storage Settings
    LOCAL_STORAGE_DIR: str = Field(default="./uploads")

    # AWS S3 Settings
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: Optional[str] = "us-east-1"
    AWS_BUCKET_NAME: Optional[str] = None

    # Azure Blob Storage Settings
    AZURE_STORAGE_CONNECTION_STRING: Optional[str] = None
    AZURE_CONTAINER_NAME: Optional[str] = None

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

settings = Settings()

# Ensure local storage directories exist on config load if using local storage
if settings.STORAGE_PROVIDER == "local":
    for subfolder in ["images", "heatmaps", "reports", "models"]:
        os.makedirs(os.path.join(settings.LOCAL_STORAGE_DIR, subfolder), exist_ok=True)
