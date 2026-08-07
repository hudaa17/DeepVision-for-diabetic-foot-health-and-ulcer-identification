import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    image_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("images.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    patient_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )
    model_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("model_versions.id", ondelete="SET NULL"), 
        nullable=True
    )
    risk_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True) # normal, mild, severe
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    probability_normal: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    probability_mild: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    probability_severe: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    heatmap_storage_key: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    recommendations: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False) # pending, processing, completed, failed
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )

    # Relationships
    image = relationship("Image", back_populates="predictions")
    patient = relationship("Patient", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")
    report = relationship("Report", back_populates="prediction", uselist=False, cascade="all, delete-orphan")
