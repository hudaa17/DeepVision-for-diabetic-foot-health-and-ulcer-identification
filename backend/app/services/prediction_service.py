import uuid
from typing import Optional, List, Dict, Any
from fastapi import BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.prediction import Prediction
from app.models.image import Image
from app.repositories.prediction import prediction_repo
from app.repositories.model_version import model_version_repo
from app.services.storage import storage_service
from app.services.redis_service import redis_service
from app.services.audit_service import audit_service
from app.ml.preprocessing import preprocess_foot_image
from app.ml.segmentation import run_watershed_segmentation
from app.ml.mobilenet import model_runner
from app.ml.gradcam import generate_gradcam_heatmap
from app.ml.recommendation import get_recommendations_for_risk

import cv2
import logging

logger = logging.getLogger(__name__)

class PredictionService:
    async def create_prediction_task(
        self, 
        db: AsyncSession, 
        image_id: uuid.UUID, 
        patient_id: uuid.UUID, 
        uploader_user: Any, 
        background_tasks: BackgroundTasks,
        ip: Optional[str] = None
    ) -> Prediction:
        """Create a pending prediction and enqueue the pipeline as a background task."""
        # 1. Verify image exists
        img_result = await db.execute(select(Image).filter(Image.id == image_id))
        image = img_result.scalars().first()
        if not image:
            raise ValueError("Image not found.")
            
        # Get active model version
        active_model = await model_version_repo.get_active_model(db)
        model_version_id = active_model.id if active_model else None

        # 2. Create database prediction object in pending state
        prediction = Prediction(
            image_id=image_id,
            patient_id=patient_id,
            model_version_id=model_version_id,
            status="pending"
        )
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)

        # 3. Cache initial status in Redis
        status_data = {
            "prediction_id": str(prediction.id),
            "status": "pending",
            "progress": 0,
            "message": "Queued for processing"
        }
        await redis_service.set_prediction_status(str(prediction.id), status_data)

        # 4. Queue background task
        background_tasks.add_task(
            self._run_async_pipeline,
            prediction_id=prediction.id,
            image_id=image_id,
            patient_id=patient_id,
            model_version_id=model_version_id,
            uploader_id=uploader_user.id,
            ip_address=ip
        )
        
        await audit_service.log_prediction_request(db, uploader_user, patient_id, image_id, prediction.id, ip)
        return prediction

    async def _run_async_pipeline(
        self,
        prediction_id: uuid.UUID,
        image_id: uuid.UUID,
        patient_id: uuid.UUID,
        model_version_id: Optional[uuid.UUID],
        uploader_id: uuid.UUID,
        ip_address: Optional[str]
    ) -> None:
        """Execute the heavy ML/Image-Processing pipeline inside a background worker."""
        # Since this runs in background after HTTP request returns, create a dedicated DB session
        async with AsyncSessionLocal() as db:
            try:
                # Update status to processing
                await self._update_pipeline_status(prediction_id, "processing", 10, "Downloading foot image...")
                
                # Fetch image record
                img_result = await db.execute(select(Image).filter(Image.id == image_id))
                image = img_result.scalars().first()
                if not image:
                    raise FileNotFoundError("Source image record missing from database.")

                # Download raw image bytes
                image_bytes = await storage_service.download_file(image.storage_key)
                
                # Preprocess image (Bilateral filter + CLAHE + scaling)
                await self._update_pipeline_status(prediction_id, "processing", 30, "Preprocessing and filtering image...")
                rgb_img, preprocessed_tensor = preprocess_foot_image(image_bytes)

                # Execute Watershed Segmentation
                await self._update_pipeline_status(prediction_id, "processing", 50, "Executing Watershed segmentation...")
                segmented_overlay, binary_mask = run_watershed_segmentation(rgb_img)
                
                # Save segmented image to storage
                segmented_ext = image.storage_key.split(".")[-1]
                segmented_key = f"segmented/{patient_id}/{prediction_id}_segmented.{segmented_ext}"
                _, seg_encoded = cv2.imencode(f".{segmented_ext}", cv2.cvtColor(segmented_overlay, cv2.COLOR_RGB2BGR))
                await storage_service.upload_file(
                    file_data=seg_encoded.tobytes(),
                    storage_key=segmented_key,
                    content_type=image.content_type or "image/jpeg"
                )

                # Load ML Model and Predict
                await self._update_pipeline_status(prediction_id, "processing", 70, "Running MobileNetV2 model inference...")
                
                # Model predict takes preprocessed tensor of shape (1, 224, 224, 3)
                risk_level, confidence, probabilities = model_runner.predict(preprocessed_tensor)

                # Generate Grad-CAM Heatmap
                await self._update_pipeline_status(prediction_id, "processing", 85, "Generating explainability heatmaps (Grad-CAM)...")
                
                model_runner.load()
                heatmap_img = generate_gradcam_heatmap(
                    model=model_runner.model,
                    preprocessed_tensor=preprocessed_tensor,
                    original_rgb_image=rgb_img
                )
                
                # Save Grad-CAM image to storage
                heatmap_key = f"heatmaps/{patient_id}/{prediction_id}_gradcam.png"
                _, heat_encoded = cv2.imencode(".png", cv2.cvtColor(heatmap_img, cv2.COLOR_RGB2BGR))
                await storage_service.upload_file(
                    file_data=heat_encoded.tobytes(),
                    storage_key=heatmap_key,
                    content_type="image/png"
                )

                # Retrieve Care Recommendations
                recommendations = get_recommendations_for_risk(risk_level)

                # Save results to DB
                pred_result = await db.execute(select(Prediction).filter(Prediction.id == prediction_id))
                prediction = pred_result.scalars().first()
                if prediction:
                    prediction.status = "completed"
                    prediction.risk_level = risk_level
                    prediction.confidence_score = confidence
                    prediction.probability_normal = probabilities[0]
                    prediction.probability_mild = probabilities[1]
                    prediction.probability_severe = probabilities[2]
                    prediction.heatmap_storage_key = heatmap_key
                    prediction.recommendations = recommendations
                    
                    # Update image status to processed
                    image.is_processed = True
                    db.add(prediction)
                    db.add(image)
                    await db.commit()
                
                # Update cache
                await self._update_pipeline_status(
                    prediction_id, 
                    "completed", 
                    100, 
                    "Analysis completed successfully",
                    risk_level=risk_level,
                    confidence=confidence
                )
                
                # Log successful prediction audit
                logger.info(f"Successfully processed prediction {prediction_id} for patient {patient_id}")
                
            except Exception as e:
                logger.error(f"Async prediction pipeline failed for prediction {prediction_id}: {e}", exc_info=True)
                # Mark as failed in DB
                pred_result = await db.execute(select(Prediction).filter(Prediction.id == prediction_id))
                prediction = pred_result.scalars().first()
                if prediction:
                    prediction.status = "failed"
                    db.add(prediction)
                    await db.commit()
                
                await self._update_pipeline_status(prediction_id, "failed", 100, f"Processing failed: {str(e)}")

    async def _update_pipeline_status(
        self, 
        prediction_id: uuid.UUID, 
        status: str, 
        progress: int, 
        message: str,
        risk_level: Optional[str] = None,
        confidence: Optional[float] = None
    ) -> None:
        """Helper to save prediction tracking status to Redis."""
        status_data = {
            "prediction_id": str(prediction_id),
            "status": status,
            "progress": progress,
            "message": message
        }
        if risk_level:
            status_data["risk_level"] = risk_level
        if confidence:
            status_data["confidence_score"] = confidence
            
        await redis_service.set_prediction_status(str(prediction_id), status_data)

    async def get_prediction(self, db: AsyncSession, prediction_id: uuid.UUID) -> Optional[Prediction]:
        return await prediction_repo.get(db, prediction_id)

    async def list_patient_history(
        self, db: AsyncSession, patient_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> List[Prediction]:
        return await prediction_repo.get_by_patient(db, patient_id, skip=skip, limit=limit)

    async def list_recent_predictions(self, db: AsyncSession, limit: int = 10) -> List[Prediction]:
        return await prediction_repo.get_recent_predictions(db, limit=limit)

    async def delete_prediction(self, db: AsyncSession, prediction_id: uuid.UUID) -> bool:
        pred = await prediction_repo.get(db, prediction_id)
        if not pred:
            return False
        
        # Delete related heatmap from storage
        if pred.heatmap_storage_key:
            await storage_service.delete_file(pred.heatmap_storage_key)
            
        await db.delete(pred)
        await db.commit()
        return True

prediction_service = PredictionService()
