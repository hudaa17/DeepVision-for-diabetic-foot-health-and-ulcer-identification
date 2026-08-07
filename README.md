# CuraVision - Intelligent Diabetic Foot Risk Assessment System Backend

An enterprise-grade, secure, and highly scalable FastAPI backend for predicting diabetic foot ulcer risks from clinical foot images.

---

## Key Architectural Enhancements

1. **Async Engine & AsyncSession**: Leverages SQLAlchemy 2.0 Async IO engines with `postgresql+asyncpg` driver to maximize application throughput under high concurrent request loads.
2. **Repository Pattern**: Segregates database querying and operations from domain-specific service logic via an asynchronous generic `BaseRepository` and specialized subclasses.
3. **Asynchronous Background Processing**: Moves image processing, Watershed segmentation, MobileNetV2 prediction, and ReportLab PDF compilation to FastAPI background threads to prevent web request blocking.
4. **Redis Integration**: Implements a high-performance Redis cache for system dashboards, JWT revocation check blacklists, rate limiting, and temporary task progress state storage.
5. **Storage Provider Interface**: Features an abstract interface (`BaseStorage`) supporting out-of-the-box switching between local file storage, AWS S3, and Azure Blob Storage via simple environment configuration.
6. **Detailed Audit trail**: Automatically writes security logs to database tables tracking successful/failed log-ins, client IP tracking, patient modifications, predictions, and downloads.
7. **System Resource Monitoring**: Exposes Prometheus metrics at `/metrics` and checks CPU/RAM/Disk stats dynamically from administrative endpoints.

---

## Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/                   # Versioned API routes
│   │       ├── admin.py
│   │       ├── auth.py
│   │       ├── dashboard.py
│   │       ├── images.py
│   │       ├── patients.py
│   │       ├── predictions.py
│   │       └── reports.py
│   ├── core/
│   │   ├── config.py             # App configurations
│   │   ├── database.py           # Database connection & deps
│   │   ├── jwt.py                # Token generation & decode
│   │   ├── logging_config.py     # JSON Structured logger
│   │   └── security.py           # Passwords helper
│   ├── middleware/
│   │   ├── audit_log.py          # Latency & request logs
│   │   ├── rate_limit.py         # Redis rate limiter
│   │   └── trace.py              # X-Correlation-ID middleware
│   ├── ml/                       # Machine Learning modules
│   │   ├── gradcam.py            # Grad-CAM heatmap generation
│   │   ├── mobilenet.py          # MobileNetV2 model predictions
│   │   ├── preprocessing.py      # Bilateral Denoising + CLAHE
│   │   ├── recommendation.py     # Clinical recommendation mapping
│   │   └── segmentation.py       # Watershed segmentation
│   ├── models/                   # SQLAlchemy DB models
│   │   ├── audit_log.py
│   │   ├── image.py
│   │   ├── model_version.py
│   │   ├── patient.py
│   │   ├── prediction.py
│   │   ├── report.py
│   │   └── user.py
│   ├── repositories/             # Database access repository pattern
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── patient.py
│   │   ├── prediction.py
│   │   ├── model_version.py
│   │   └── audit_log.py
│   ├── schemas/                  # Pydantic validation schemas (v2)
│   └── services/                 # Business logic services
│       ├── storage/              # Storage Providers (Local/S3/Azure)
│       └── ...
│   ├── main.py                   # App startup & initialization
│   ├── alembic.ini               # Alembic configuration
│   ├── migrations/               # Database migration scripts
│   ├── tests/                    # Pytest suite
│   ├── requirements.txt          # Frozen python dependencies
│   ├── Dockerfile                # Production multi-stage Docker build
│   └── docker-compose.yml        # Multi-service setup (App, PG, Redis)
```

---

## Running with Docker Compose (Recommended)

To run the complete system (FastAPI app, PostgreSQL, Redis) with database migrations executed automatically on startup:

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and launch the containers:
   ```bash
   docker-compose up --build
   ```
3. Once running:
   - **Swagger Documentation**: visit `http://localhost:8000/docs`
   - **Prometheus Metrics**: visit `http://localhost:8000/metrics`
   - **Default Admin Account**:
     - **Email**: `admin@curavision.org`
     - **Password**: `AdminSecure123!`

---

## Running Locally

If you wish to run the app outside of Docker, ensure you have PostgreSQL and Redis running on your system:

1. Install requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Configure `.env` file (refer to `.env.example` template):
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Execute migrations to set up the DB schemas:
   ```bash
   cd backend
   alembic upgrade head
   ```
4. Start the application:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

---

## Executing the Test Suite

We use pytest for unit, integration, and API testing:

```bash
cd backend
pytest tests/
```

To run with coverage or print outputs:
```bash
pytest tests/ -v -s
```

---

## Core API Endpoints

### 1. Authentication (`/api/v1/auth`)
- `POST /auth/register`: Create user account.
- `POST /auth/login`: Login OAuth2 Password flow (returns token).
- `POST /auth/logout`: Revoke active session token.
- `POST /auth/refresh`: Rotate refresh token.
- `GET /auth/me`: Fetch current authenticated profile.

### 2. Patients Profile (`/api/v1/patients`)
- `POST /patients`: Register new patient.
- `GET /patients`: Filtered pagination listing.
- `GET /patients/{id}`: Detailed patient profile retrieval.
- `PUT /patients/{id}`: Update patient details.
- `DELETE /patients/{id}`: Remove patient record.

### 3. Images Upload (`/api/v1/images`)
- `POST /images/upload`: Upload patient foot photo.
- `GET /images/{id}`: Fetch image record metadata.
- `GET /images/{id}/file`: Serve image binary file.

### 4. Risk Prediction (`/api/v1/predictions`)
- `POST /predict/{image_id}`: Trigger async prediction task.
- `GET /predictions/{id}`: View analysis results and recommendations.
- `GET /predictions/status/{id}`: Poll background worker progress from Redis.

### 5. PDF Reporting (`/api/v1/reports`)
- `POST /reports/{prediction_id}`: Compile PDF report.
- `GET /reports/download/{prediction_id}`: Download clinical report attachment.

### 6. Admin Panel (`/api/v1/admin`)
- `GET /admin/users`: List system accounts.
- `POST /admin/retrain`: Trigger model retraining.
- `GET /admin/logs`: Access security audit logs.
- `GET /admin/monitoring`: Inspect server resources usage.
