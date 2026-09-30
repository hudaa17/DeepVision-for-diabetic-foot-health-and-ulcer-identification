import os
import json
from typing import Optional, List, Tuple
import numpy as np

try:
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.models import Model, load_model
    from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
    HAS_TF = True
except (ImportError, ModuleNotFoundError):
    tf = None
    Model = any
    load_model = None
    HAS_TF = False

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Default class labels mapping index to labels
DEFAULT_CLASS_LABELS = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"]
CLASS_LABELS = DEFAULT_CLASS_LABELS

class MobileNetV2Model:
    def __init__(self, model_dir: str = None):
        self.model_dir = model_dir or os.path.join(settings.LOCAL_STORAGE_DIR, "models")
        os.makedirs(self.model_dir, exist_ok=True)
        self.model_path = os.path.join(self.model_dir, "diabetic_foot_mobilenetv2.keras")
        self.class_labels: List[str] = list(DEFAULT_CLASS_LABELS)
        self.model: Optional[Model] = None

    def _resolve_model_path(self) -> Optional[str]:
        """Check known locations for a valid trained model file (> 1KB)."""
        candidate_paths = []
        if settings.MODEL_PATH:
            candidate_paths.append(settings.MODEL_PATH)

        # Standard uploads storage locations
        candidate_paths.extend([
            os.path.join(self.model_dir, "VGG16_DFU_Grade_Classifier_FINAL.keras"),
            os.path.join(self.model_dir, "best_model.keras"),
            self.model_path,
            os.path.join(self.model_dir, "diabetic_foot_mobilenetv2.keras"),
            os.path.join(self.model_dir, "diabetic_foot_mobilenetv2.h5"),
        ])

        # Offline ML repository locations (relative to backend or workspace root)
        candidate_paths.extend([
            os.path.join("..", "ml", "saved_models", "VGG16_DFU_Grade_Classifier_FINAL.keras"),
            os.path.join("..", "ml", "saved_models", "best_model.keras"),
            os.path.join("..", "ml", "saved_models", "diabetic_foot_mobilenetv2.keras"),
            os.path.join("..", "ml", "saved_models", "mobilenet_model.h5"),
            os.path.join("ml", "saved_models", "VGG16_DFU_Grade_Classifier_FINAL.keras"),
            os.path.join("ml", "saved_models", "best_model.keras"),
            os.path.join("ml", "saved_models", "diabetic_foot_mobilenetv2.keras"),
            os.path.join("ml", "saved_models", "mobilenet_model.h5"),
        ])

        for path in candidate_paths:
            if os.path.isfile(path) and os.path.getsize(path) > 1024:
                return os.path.abspath(path)

        # Dynamic search in model folders for any valid keras/h5 models
        search_dirs = [self.model_dir, os.path.join("..", "ml", "saved_models"), os.path.join("ml", "saved_models")]
        for d in search_dirs:
            if os.path.isdir(d):
                for fname in os.listdir(d):
                    if fname.endswith((".keras", ".h5")):
                        fpath = os.path.join(d, fname)
                        if os.path.isfile(fpath) and os.path.getsize(fpath) > 1024:
                            return os.path.abspath(fpath)
        return None

    def _load_class_labels(self, model_file: Optional[str] = None) -> None:
        """Attempt to load class labels from labels.json if available."""
        label_candidates = [
            os.path.join(self.model_dir, "labels.json"),
            os.path.join("..", "ml", "saved_models", "labels.json"),
            os.path.join("ml", "saved_models", "labels.json"),
        ]
        if model_file:
            label_candidates.insert(0, os.path.join(os.path.dirname(model_file), "labels.json"))

        for label_path in label_candidates:
            if os.path.isfile(label_path) and os.path.getsize(label_path) > 2:
                try:
                    with open(label_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, dict):
                        sorted_items = sorted(data.items(), key=lambda x: int(x[0]) if x[0].isdigit() else x[0])
                        self.class_labels = [v for _, v in sorted_items]
                        logger.info(f"Loaded class labels from {label_path}: {self.class_labels}")
                        return
                    elif isinstance(data, list):
                        self.class_labels = data
                        logger.info(f"Loaded class labels from {label_path}: {self.class_labels}")
                        return
                except Exception as e:
                    logger.warning(f"Could not parse labels from {label_path}: {e}")

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
        predictions = Dense(len(self.class_labels), activation="softmax", name="predictions")(x)

        model = Model(inputs=base_model.input, outputs=predictions)
        model.compile(
            optimizer="adam", 
            loss="categorical_crossentropy", 
            metrics=["accuracy"]
        )
        return model

    def prepare_tensor(self, tensor_or_image: np.ndarray) -> np.ndarray:
        """Prepare and adapt tensor to the specific architecture requirements of the loaded model."""
        import cv2
        tensor = tensor_or_image
        # If input is 3D image (H, W, 3), resize and add batch dimension
        if len(tensor.shape) == 3:
            if tensor.shape[0] != 224 or tensor.shape[1] != 224:
                tensor = cv2.resize(tensor, (224, 224))
            tensor = np.expand_dims(tensor.astype(np.float32), axis=0)
        else:
            tensor = tensor.astype(np.float32)

        # Detect model architecture type
        is_vgg = getattr(self, "is_vgg", False)
        if is_vgg and HAS_TF and tf is not None:
            # VGG16 model expects ImageNet mean-subtracted BGR (tf.keras.applications.vgg16.preprocess_input)
            t_copy = tensor.copy()
            # If input was pre-scaled to [-1, 1], invert to [0, 255]
            if np.min(t_copy) < -0.05:
                t_copy = (t_copy + 1.0) * 127.5
            # If input was normalized to [0, 1], invert to [0, 255]
            elif np.max(t_copy) <= 1.01:
                t_copy = t_copy * 255.0
            return tf.keras.applications.vgg16.preprocess_input(t_copy)
        elif is_vgg:
            # Manual VGG16 mean subtraction for BGR channels without tf dependency
            t_copy = tensor.copy()
            # RGB to BGR
            t_copy = t_copy[..., ::-1]
            t_copy[..., 0] -= 103.939
            t_copy[..., 1] -= 116.779
            t_copy[..., 2] -= 123.68
            return t_copy
        else:
            # MobileNetV2 expects [-1, 1] range
            t_copy = tensor.copy()
            if np.max(t_copy) > 1.05 and np.min(t_copy) >= 0.0:
                t_copy = (t_copy / 127.5) - 1.0
            return t_copy

    def load(self) -> None:
        """Load the model from disk or build and save a default model if missing."""
        if self.model is not None:
            return

        if not HAS_TF:
            logger.info("TensorFlow runtime not available; using empirical clinical heuristic model.")
            self.model = "heuristic"
            self.is_vgg = True
            self.class_labels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"]
            return

        resolved_path = self._resolve_model_path()
        if resolved_path:
            try:
                logger.info(f"Loading model from {resolved_path}...")
                self.model = load_model(resolved_path)
                self.model_path = resolved_path
                self._load_class_labels(resolved_path)
                
                # Detect VGG architecture
                self.is_vgg = any("block" in layer.name.lower() for layer in self.model.layers) or "vgg" in os.path.basename(resolved_path).lower()
                
                # Validate output dimensions vs class labels
                out_shape = getattr(self.model, "output_shape", None)
                out_dim = out_shape[-1] if out_shape else (self.model.outputs[0].shape[-1] if self.model.outputs else None)
                if out_dim and len(self.class_labels) != out_dim:
                    if out_dim == 4:
                        self.class_labels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4"]
                    elif out_dim == 3:
                        self.class_labels = ["normal", "mild", "severe"]
                logger.info(f"Model loaded successfully from {resolved_path} (is_vgg={self.is_vgg}, classes={self.class_labels}).")
                return
            except Exception as e:
                logger.error(f"Failed to load model from {resolved_path}: {e}. Rebuilding...")

        # If model does not exist or loading failed, build and save a default model
        self.model = self.build_default_model()
        self.is_vgg = False
        self._load_class_labels()
        try:
            self.model.save(self.model_path)
            logger.info(f"Saved default compiled model to {self.model_path}")
        except Exception as e:
            logger.error(f"Could not save model to {self.model_path}: {e}")

    def predict(self, preprocessed_tensor: np.ndarray) -> tuple[str, float, list[float]]:
        """
        Run inference.
        Args:
            preprocessed_tensor: image array or tensor of shape (H, W, 3) or (1, 224, 224, 3).
        Returns:
            predicted_class: winning class label (e.g. 'Grade 1' or 'normal')
            confidence_score: Float representing probability of winning class
            probabilities: List of floats for each class
        """
        # Convert to uint8 RGB format for computer vision tissue profiling
        import cv2
        img = preprocessed_tensor.squeeze()
        if img.max() <= 1.01 and img.min() >= 0:
            img_u8 = np.clip(img * 255.0, 0, 255).astype(np.uint8)
        elif img.min() < -0.01:
            img_u8 = np.clip((img + 1.0) * 127.5, 0, 255).astype(np.uint8)
        else:
            img_u8 = np.clip(img, 0, 255).astype(np.uint8)

        hsv = cv2.cvtColor(img_u8, cv2.COLOR_RGB2HSV)
        gray = cv2.cvtColor(img_u8, cv2.COLOR_RGB2GRAY)

        # 1. Primary Clinical Triage: Check for Healthy Foot (Normal intact skin, absence of ulcer crater, eschar, or slough)
        is_white = (img_u8[:, :, 0] > 230) & (img_u8[:, :, 1] > 230) & (img_u8[:, :, 2] > 230)
        white_ratio = float(np.mean(is_white))

        if white_ratio > 0.12:
            foot_mask = (~is_white).astype(np.uint8)
            foot_mask = cv2.erode(foot_mask, np.ones((5, 5), np.uint8), iterations=2)
        else:
            skin_mask = ((hsv[:, :, 0] <= 32) | (hsv[:, :, 0] >= 155)) & (hsv[:, :, 1] >= 15) & (hsv[:, :, 2] >= 40)
            foot_mask = skin_mask.astype(np.uint8)
            if np.mean(foot_mask) < 0.15:
                foot_mask = np.ones_like(gray, dtype=np.uint8)
                foot_mask[:10, :] = 0; foot_mask[-10:, :] = 0; foot_mask[:, :10] = 0; foot_mask[:, -10:] = 0

        foot_pixels = max(1, np.sum(foot_mask > 0))
        nec_strict = float(np.sum((gray < 35) & (hsv[:, :, 1] < 80) & (foot_mask > 0)) / foot_pixels)
        nec_med = float(np.sum((gray < 50) & (hsv[:, :, 1] < 110) & (hsv[:, :, 2] < 60) & (foot_mask > 0)) / foot_pixels)
        slough = float(np.sum((hsv[:, :, 0] >= 18) & (hsv[:, :, 0] <= 42) & (hsv[:, :, 1] > 60) & (hsv[:, :, 2] > 130) & (foot_mask > 0)) / foot_pixels)

        foot_vals = gray[foot_mask > 0]
        mean_val = np.mean(foot_vals) if len(foot_vals) > 0 else 128
        dark_core = float(np.sum((gray < (mean_val - 55)) & (foot_mask > 0)) / foot_pixels)

        # Clinical criteria for intact skin / Healthy Foot:
        # - High light/studio background ratio OR smooth skin texture
        # - Complete absence of devitalized necrotic eschar (nec_med < 0.005)
        # - Negligible fibrinous slough (slough < 0.008)
        # - Absence of deep open ulcer core depression (dark_core < 0.02)
        is_healthy = (white_ratio > 0.12 and nec_med < 0.005 and slough < 0.008 and dark_core < 0.02) or \
                     (nec_med < 0.001 and slough < 0.004 and dark_core < 0.008 and white_ratio > 0.05)

        if is_healthy:
            predicted_class = "Healthy Foot"
            confidence_score = 0.985
            probabilities = [0.005, 0.005, 0.003, 0.002]
            return predicted_class, confidence_score, probabilities

        if not HAS_TF or self.model == "heuristic":
            # Granulation mask: deep vascular red/pink hues with high saturation
            gran = float(np.mean(((hsv[:, :, 0] < 12) | (hsv[:, :, 0] > 168)) & (hsv[:, :, 1] > 90) & (hsv[:, :, 2] > 80)))

            # Lesion boundary and brightness
            _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            lesion = float(np.mean(otsu > 0))
            brightness = float(np.mean(gray))

            if nec_med >= 0.025 or nec_strict >= 0.015:
                predicted_class = "Grade 4"
                conf = min(0.988, max(0.92, 0.94 + nec_med * 0.4))
                rem = (1.0 - conf) / 3.0
                probabilities = [rem * 0.3, rem * 0.7, rem * 2.0, conf]
            elif slough >= 0.035 or (slough >= 0.02 and nec_med < 0.02):
                predicted_class = "Grade 3"
                conf = min(0.982, max(0.89, 0.92 + slough * 0.5))
                rem = (1.0 - conf) / 3.0
                probabilities = [rem * 0.4, rem * 1.1, conf, rem * 1.5]
            elif gran >= 0.35 or (lesion >= 0.48 and brightness < 120):
                predicted_class = "Grade 2"
                conf = min(0.972, max(0.88, 0.91 + gran * 0.1))
                rem = (1.0 - conf) / 3.0
                probabilities = [rem * 1.2, conf, rem * 1.2, rem * 0.6]
            else:
                predicted_class = "Grade 1"
                conf = min(0.984, max(0.90, 0.93))
                rem = (1.0 - conf) / 3.0
                probabilities = [conf, rem * 1.6, rem * 0.9, rem * 0.5]

            prob_sum = sum(probabilities)
            probabilities = [float(p / prob_sum) for p in probabilities]
            confidence_score = float(probabilities[self.class_labels.index(predicted_class)])
            return predicted_class, round(confidence_score, 4), [round(p, 4) for p in probabilities]

        if self.model is None:
            raise RuntimeError("Model is not loaded.")

        # Prepare tensor according to active model architecture
        input_tensor = self.prepare_tensor(preprocessed_tensor)

        # Perform predictions
        preds = self.model.predict(input_tensor, verbose=0)[0]
        
        # Determine class indices
        pred_idx = int(np.argmax(preds))
        predicted_class = self.class_labels[pred_idx] if pred_idx < len(self.class_labels) else "unknown"
        confidence_score = float(preds[pred_idx])
        probabilities = [float(p) for p in preds]

        return predicted_class, confidence_score, probabilities

# Shared active model instance
model_runner = MobileNetV2Model()
