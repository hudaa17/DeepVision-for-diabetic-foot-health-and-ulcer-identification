import cv2
import numpy as np

def apply_noise_reduction(image: np.ndarray) -> np.ndarray:
    """Apply Bilateral Filter to reduce noise while maintaining sharp edges."""
    # d=9, sigmaColor=75, sigmaSpace=75 is standard for general edge-preserving smoothing
    return cv2.bilateralFilter(image, d=9, sigmaColor=75, sigmaSpace=75)

def apply_clahe_contrast_enhancement(image: np.ndarray) -> np.ndarray:
    """Apply Contrast Limited Adaptive Histogram Equalization (CLAHE) on LAB color space."""
    # Convert image from RGB (expected input) to LAB color space
    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    l_chan, a, b = cv2.split(lab)
    
    # Create CLAHE object
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_chan)
    
    # Merge and convert back to RGB
    limg = cv2.merge((cl, a, b))
    return cv2.cvtColor(limg, cv2.COLOR_LAB2RGB)

def preprocess_foot_image(image_bytes: bytes, target_size: tuple = (224, 224)) -> tuple[np.ndarray, np.ndarray]:
    """
    Complete preprocessing pipeline.
    Returns:
        1. rgb_img: Original clinical RGB image in array form.
        2. model_tensor: Float32 RGB tensor of shape (1, 224, 224, 3) ready for model_runner.
    """
    # Load image from bytes using OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    # Decode to BGR
    bgr_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr_img is None:
        raise ValueError("Could not decode image bytes.")
        
    # Convert BGR to RGB
    rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    
    # Resize to model input shape (preserving clinical color distribution for neural network)
    resized = cv2.resize(rgb_img, target_size, interpolation=cv2.INTER_AREA)
    model_tensor = np.expand_dims(resized.astype(np.float32), axis=0)
    
    return rgb_img, model_tensor
