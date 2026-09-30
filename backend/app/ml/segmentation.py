import cv2
import numpy as np
from skimage.segmentation import watershed
from skimage.feature import peak_local_max
from scipy import ndimage

def run_watershed_segmentation(rgb_image: np.ndarray, is_healthy: bool = False) -> tuple[np.ndarray, np.ndarray]:
    """
    Perform Watershed Segmentation on a foot image using OpenCV and Scikit-image.
    
    Args:
        rgb_image: ndarray of shape (H, W, 3) in RGB color space.
        is_healthy: Boolean indicating if the foot is clinically healthy (intact skin, Wagner 0).
    Returns:
        segmented_overlay: ndarray of shape (H, W, 3) - original image with segment boundaries overlaid.
        binary_mask: ndarray of shape (H, W) - binary mask of the segmented regions (255 = target region, 0 = background).
    """
    if is_healthy:
        h, w = rgb_image.shape[:2]
        is_white = (rgb_image[:, :, 0] > 230) & (rgb_image[:, :, 1] > 230) & (rgb_image[:, :, 2] > 230)
        foot_mask = (~is_white).astype(np.uint8) * 255
        contours, _ = cv2.findContours(foot_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        segmented_overlay = rgb_image.copy()
        if contours:
            cv2.drawContours(segmented_overlay, contours, -1, (16, 185, 129), 3) # Emerald green intact contour
        binary_mask = np.zeros((h, w), dtype=np.uint8)
        return segmented_overlay, binary_mask

    # 1. Convert to grayscale and blur
    gray = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 2. Otsu thresholding to find primary boundaries
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # 3. Morphological operations to clean noise
    kernel = np.ones((3, 3), np.uint8)
    opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)
    
    # 4. Sure background area
    sure_bg = cv2.dilate(opening, kernel, iterations=3)
    
    # 5. Distance Transform for sure foreground
    dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
    # The peaks in distance transform represent the center of segmented zones
    ret, sure_fg = cv2.threshold(dist_transform, 0.2 * dist_transform.max(), 255, 0)
    
    # 6. Unknown region (boundary band)
    sure_fg = np.uint8(sure_fg)
    unknown = cv2.subtract(sure_bg, sure_fg)
    
    # 7. Label markers
    # Using scipy/skimage to find local peaks for watershed seeds
    # Alternatively, use cv2.connectedComponents which is highly stable
    ret, markers = cv2.connectedComponents(sure_fg)
    
    # Add one to all labels so that sure background is not 0, but 1
    markers = markers + 1
    
    # Mark the unknown region with zero
    markers[unknown == 255] = 0
    
    # 8. Apply Watershed (OpenCV or Skimage). OpenCV's watershed modifies the marker array directly
    # Watershed expects the original image in BGR/RGB format.
    # Note: OpenCV watershed takes a 3-channel image (BGR/RGB) and 32-bit int markers
    img_for_ws = rgb_image.copy()
    markers_cv = markers.copy()
    cv2.watershed(img_for_ws, markers_cv)
    
    # markers_cv is -1 at boundaries
    binary_mask = np.zeros(gray.shape, dtype=np.uint8)
    binary_mask[markers_cv > 1] = 255
    
    # 9. Create overlay (outline boundaries in red on the original image)
    segmented_overlay = rgb_image.copy()
    segmented_overlay[markers_cv == -1] = [255, 0, 0] # Draw red boundary
    
    return segmented_overlay, binary_mask
