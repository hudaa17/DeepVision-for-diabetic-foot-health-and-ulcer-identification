import os
import cv2
import pytest
import numpy as np
from app.ml.mobilenet import model_runner
from app.ml.gradcam import generate_gradcam_heatmap
from app.ml.recommendation import get_recommendations_for_risk

def test_model_loading_and_labels():
    """Verify that model_runner automatically loads the trained model and 4 Grade classes."""
    model_runner.model = None  # Force reload
    model_runner.load()
    
    assert model_runner.model is not None, "Model failed to load"
    assert model_runner.class_labels == ["Grade 1", "Grade 2", "Grade 3", "Grade 4"]
    assert model_runner.is_vgg is True, "Expected VGG16 architecture detection"

def test_inference_on_sample_test_images():
    """Test model inference on sample images from each Grade in the test set."""
    model_runner.load()
    
    test_cases = [
        ("Grade 1", "ml/dataset/test/Grade 1/112_jpg.rf.472615b206cdec5593b07c5716920e47.jpg"),
        ("Grade 2", "ml/dataset/test/Grade 2/7_jpg.rf.9d42721e5267dd74b9b4a62dce8d7373.jpg"),
        ("Grade 3", "ml/dataset/test/Grade 3/405_jpg.rf.099192c104e44796e0d51387af02440c.jpg"),
        ("Grade 4", "ml/dataset/test/Grade 4/97_jpg.rf.e4a0aba14087b095be29b179b3a377d9.jpg")
    ]
    
    # Try resolving relative path from backend or root
    for expected_grade, rel_path in test_cases:
        path = os.path.join("..", rel_path) if not os.path.exists(rel_path) else rel_path
        if not os.path.exists(path):
            continue
            
        img_bgr = cv2.imread(path)
        assert img_bgr is not None, f"Could not read test image {path}"
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        
        predicted_class, confidence, probabilities = model_runner.predict(img_rgb)
        
        assert predicted_class == expected_grade, f"Expected {expected_grade}, got {predicted_class}"
        assert confidence >= 0.85, f"Confidence {confidence} for {expected_grade} should be >= 0.85"
        assert len(probabilities) == 4, f"Expected 4 probability values, got {len(probabilities)}"
        assert np.isclose(sum(probabilities), 1.0, atol=1e-3), "Probabilities must sum to 1"

def test_gradcam_overlay():
    """Verify that Grad-CAM produces a valid overlaid heatmap with no errors."""
    model_runner.load()
    sample_path = "ml/dataset/test/Grade 1/112_jpg.rf.472615b206cdec5593b07c5716920e47.jpg"
    path = os.path.join("..", sample_path) if not os.path.exists(sample_path) else sample_path
    
    if os.path.exists(path):
        img_bgr = cv2.imread(path)
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        tensor = model_runner.prepare_tensor(img_rgb)
        
        overlaid = generate_gradcam_heatmap(
            model=model_runner.model,
            preprocessed_tensor=tensor,
            original_rgb_image=img_rgb,
            target_class_idx=0
        )
        
        assert overlaid is not None
        assert overlaid.shape == img_rgb.shape
        assert overlaid.dtype == np.uint8

def test_clinical_recommendations_for_grades():
    """Verify that clinical care recommendations exist for all grades."""
    for grade in ["Grade 1", "Grade 2", "Grade 3", "Grade 4"]:
        recs = get_recommendations_for_risk(grade)
        assert recs is not None
        assert "urgency" in recs
        assert "actions" in recs
        assert len(recs["actions"]) > 0
