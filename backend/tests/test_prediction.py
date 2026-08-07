import pytest
import numpy as np
import cv2
from app.ml.preprocessing import apply_noise_reduction, apply_clahe_contrast_enhancement
from app.ml.segmentation import run_watershed_segmentation
from app.ml.recommendation import get_recommendations_for_risk

def test_apply_noise_reduction():
    # Arrange: Create dummy image with noise (e.g. random grid)
    img = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
    
    # Act
    denoised = apply_noise_reduction(img)
    
    # Assert
    assert denoised.shape == (100, 100, 3)
    assert denoised.dtype == np.uint8

def test_apply_clahe_contrast_enhancement():
    # Arrange: Create a very low-contrast grayscale-like RGB image
    img = np.ones((100, 100, 3), dtype=np.uint8) * 128
    
    # Act
    enhanced = apply_clahe_contrast_enhancement(img)
    
    # Assert
    assert enhanced.shape == (100, 100, 3)
    assert enhanced.dtype == np.uint8

def test_run_watershed_segmentation():
    # Arrange: Create an image with a clear shapes contrast representing a foot structure
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    cv2.circle(img, (50, 50), 30, (200, 200, 200), -1) # Draw white circle in middle
    
    # Act
    overlay, mask = run_watershed_segmentation(img)
    
    # Assert
    assert overlay.shape == (100, 100, 3)
    assert mask.shape == (100, 100)
    assert mask.max() == 255
    # The middle circle should be segmented (non-zero regions in mask)
    assert mask.any()

def test_get_recommendations_for_risk():
    # Act & Assert
    normal_recs = get_recommendations_for_risk("normal")
    assert normal_recs["urgency"] == "low"
    assert len(normal_recs["actions"]) > 0

    severe_recs = get_recommendations_for_risk("severe")
    assert severe_recs["urgency"] == "high"
    assert "IMMEDIATE" in severe_recs["follow_up"]
