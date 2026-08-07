import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Class labels mapping index to labels
CLASS_LABELS = ["normal", "mild", "severe"]

class MobileNetV2Model:
    def __init__(self, model_dir: str = None):
        self.model_dir = model_dir or os.path.join(settings.LOCAL_STORAGE_DIR, "models")
        os.makedirs(self.model_dir, exist_ok=True)
        self.model_path = os.path.join(self.model_dir, "diabetic_foot_mobilenetv2.keras")
        self.model: Optional[Model] = None

    def build_default_model(self) -> Model:
        """Create a default MobileNetV2 model structure for transfer learning."""
        logger.info("Building default MobileNetV2 model architecture...")
        
        # Load MobileNetV2 base model (no top classification head)
        try:
            base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights="imagenet")
        except Exception as e:
            logger.warning(f"Could not load weights='imagenet' (probably offline). Building model with randomized weights. Error: {e}")
            base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights=None)
            
        base_model.trainable = False  # Freeze convolutional layers

        # Construct final classification layers
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(128, activation="relu", name="dense_fc_1")(x)
        x = Dropout(0.3)(x)
        predictions = Dense(3, activation="softmax", name="predictions")(x)

        model = Model(inputs=base_model.input, outputs=predictions)
        model.compile(
            optimizer="adam", 
            loss="categorical_crossentropy", 
            metrics=["accuracy"]
        )
        return model

    def load(self) -> None:
        """Load the model from disk or build and save a default model if missing."""
        if self.model is not None:
            return

        if os.path.exists(self.model_path):
            try:
                logger.info(f"Loading MobileNetV2 model from {self.model_path}...")
                self.model = load_model(self.model_path)
                logger.info("Model loaded successfully.")
                return
            except Exception as e:
                logger.error(f"Failed to load model from {self.model_path}: {e}. Rebuilding...")

        # If model does not exist or loading failed, build and save a default model
        self.model = self.build_default_model()
        try:
            self.model.save(self.model_path)
            logger.info(f"Saved default compiled model to {self.model_path}")
        except Exception as e:
            logger.error(f"Could not save model to {self.model_path}: {e}")

    def predict(self, preprocessed_tensor: np.ndarray) -> tuple[str, float, list[float]]:
        """
        Run inference.
        Args:
            preprocessed_tensor: normalized image array of shape (1, 224, 224, 3).
        Returns:
            predicted_class: 'normal', 'mild', or 'severe'
            confidence_score: Float representing probability of winning class
            probabilities: List of floats [p_normal, p_mild, p_severe]
        """
        self.load()
        if self.model is None:
            raise RuntimeError("MobileNetV2 model is not loaded.")

        # Perform predictions (tensor input shape: (1, 224, 224, 3))
        preds = self.model.predict(preprocessed_tensor, verbose=0)[0]
        
        # Determine class indices
        pred_idx = int(np.argmax(preds))
        predicted_class = CLASS_LABELS[pred_idx]
        confidence_score = float(preds[pred_idx])
        probabilities = [float(p) for p in preds]

        return predicted_class, confidence_score, probabilities

# Shared active model instance
model_runner = MobileNetV2Model()
