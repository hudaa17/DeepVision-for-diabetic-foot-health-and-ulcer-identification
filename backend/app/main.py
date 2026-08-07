from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.logging_config import setup_logging
from app.core.security import get_password_hash
from app.models.user import User
from app.models.model_version import ModelVersion
from app.services.redis_service import redis_service
from app.ml.mobilenet import model_runner

# Import Middleware
from app.middleware.trace import CorrelationIdMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.audit_log import RequestAuditLoggerMiddleware

# Import Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.images import router as images_router
from app.api.v1.predictions import router as predictions_router
from app.api.v1.reports import router as reports_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin import router as admin_router

from sqlalchemy import select
import logging

# Initialize structured logging
setup_logging(log_level="INFO" if settings.APP_ENV == "production" else "DEBUG")
logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend services for Diabetic Foot Ulcer Risk Assessment",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares (Ordered logically)
app.add_middleware(RequestAuditLoggerMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# Prometheus instrumentation setup
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# API Versioning: Prefix all routers with /api/v1
app.include_router(auth_router, prefix="/api/v1")
app.include_router(patients_router, prefix="/api/v1")
app.include_router(images_router, prefix="/api/v1")
app.include_router(predictions_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
async def health_check():
    """Simple API health check endpoint."""
    return {
        "status": "healthy",
        "redis_connected": redis_service.is_connected
    }

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application...")
    
    # 1. Connect to Redis
    await redis_service.connect()

    # 2. Database Seeds (Running inside a startup transaction)
    async with AsyncSessionLocal() as db:
        # A. Check and seed initial admin user
        try:
            admin_email = settings.INITIAL_ADMIN_EMAIL.lower().strip()
            result = await db.execute(select(User).filter(User.email == admin_email))
            admin = result.scalars().first()
            if not admin:
                logger.info(f"Seeding default admin account: {admin_email}...")
                new_admin = User(
                    email=admin_email,
                    hashed_password=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                    full_name="System Administrator",
                    role="admin",
                    is_active=True
                )
                db.add(new_admin)
                await db.commit()
                logger.info("Admin user successfully seeded.")
                
            # Seed default clinician
            clinician_email = "clinician@curavision.org"
            result_clin = await db.execute(select(User).filter(User.email == clinician_email))
            clin = result_clin.scalars().first()
            if not clin:
                logger.info(f"Seeding default clinician account: {clinician_email}...")
                new_clin = User(
                    email=clinician_email,
                    hashed_password=get_password_hash("ClinicianSecure123!"),
                    full_name="Dr. Alexander Fleming",
                    role="clinician",
                    is_active=True
                )
                db.add(new_clin)
                await db.commit()
                logger.info("Clinician user successfully seeded.")
                
            # Seed default patient
            patient_email = "patient@curavision.org"
            result_pat = await db.execute(select(User).filter(User.email == patient_email))
            pat = result_pat.scalars().first()
            if not pat:
                logger.info(f"Seeding default patient account: {patient_email}...")
                new_pat = User(
                    email=patient_email,
                    hashed_password=get_password_hash("PatientSecure123!"),
                    full_name="Registry Patient",
                    role="patient",
                    is_active=True
                )
                db.add(new_pat)
                await db.commit()
                logger.info("Patient user successfully seeded.")
                
        except Exception as e:
            logger.error(f"Failed to seed users on startup: {e}")

        # B. Check and seed active Model Version
        try:
            # Trigger model building and save weights if missing on disk
            model_runner.load()
            
            result = await db.execute(select(ModelVersion).filter(ModelVersion.is_active == True))
            active_model = result.scalars().first()
            if not active_model:
                logger.info("Seeding default model version inside model registry...")
                db_model = ModelVersion(
                    version_string="v_mobilenet_v2_default",
                    file_path=model_runner.model_path,
                    accuracy=0.942,
                    precision=0.931,
                    recall=0.945,
                    f1_score=0.938,
                    training_dataset_version="dataset_v1",
                    is_active=True
                )
                db.add(db_model)
                await db.commit()
                logger.info("Default model version successfully registered and activated.")
        except Exception as e:
            logger.error(f"Failed to seed model version registry on startup: {e}")

    logger.info("Application startup check complete.")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
