FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /workspace

# Install system dependencies needed for OpenCV, psutil, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt requirements-ml.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
RUN pip install -r requirements-ml.txt

# Copy application code
COPY . .

# Set working directory for app execution
WORKDIR /workspace

EXPOSE 8000

# Start server (migration will be run in entrypoint or compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
