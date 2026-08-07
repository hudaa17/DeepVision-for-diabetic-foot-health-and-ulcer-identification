import cv2
import numpy as np
import tensorflow as tf
import logging

logger = logging.getLogger(__name__)

def generate_gradcam_heatmap(
    model: tf.keras.Model, 
    preprocessed_tensor: np.ndarray, 
    original_rgb_image: np.ndarray,
    target_class_idx: int = None
) -> np.ndarray:
    """
    Generate a Grad-CAM heatmap overlaid on the original image.
    
    Args:
        model: Loaded Keras/TensorFlow model.
        preprocessed_tensor: Batch input tensor shape (1, 224, 224, 3) used for prediction.
        original_rgb_image: Original loaded image array of shape (H, W, 3) in RGB format.
        target_class_idx: Target class index to inspect (if None, uses predicted class).
    Returns:
        overlaid_image: RGB image with heatmap color overlay of size (H, W, 3).
    """
    try:
        # 1. Programmatically identify the last 4D convolutional layer in the base model
        last_conv_layer = None
        for layer in reversed(model.layers):
            if len(layer.output_shape) == 4:
                last_conv_layer = layer
                break
                
        if not last_conv_layer:
            raise ValueError("No 4D convolutional layer found in model.")

        # 2. Build a sub-model that outputs the conv layer feature maps and final prediction
        grad_model = tf.keras.models.Model(
            inputs=[model.inputs],
            outputs=[last_conv_layer.output, model.output]
        )

        # 3. Compute gradients of winning class with respect to conv layer output
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(preprocessed_tensor)
            if target_class_idx is None:
                target_class_idx = tf.argmax(predictions[0])
            loss = predictions[:, target_class_idx]

        # Calculate gradients of the loss with respect to the output feature map of last conv layer
        grads = tape.gradient(loss, conv_outputs)

        # 4. Average gradients across spatial dimensions (Global Average Pooling on grads)
        # grads shape: (1, H_conv, W_conv, Channels)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # 5. Weighted combination of feature maps
        conv_outputs = conv_outputs[0]
        # Multiply each channel in feature map by its gradient weight
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        # 6. Apply ReLU to isolate positive influences, then normalize between 0 and 1
        heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-10)
        heatmap = heatmap.numpy()

        # 7. Postprocess: Resize heatmap to match the original image size
        height, width, _ = original_rgb_image.shape
        heatmap_resized = cv2.resize(heatmap, (width, height))
        
        # Scale to 0-255
        heatmap_u8 = np.uint8(255 * heatmap_resized)
        
        # Apply Jet Colormap (heatmap is grayscale, colormap turns it to colors)
        color_heatmap = cv2.applyColorMap(heatmap_u8, cv2.COLORMAP_JET)
        
        # Convert color map from BGR (OpenCV default) to RGB
        color_heatmap_rgb = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB)
        
        # 8. Blend overlay onto original image (alpha blending)
        alpha = 0.4
        overlaid_image = cv2.addWeighted(color_heatmap_rgb, alpha, original_rgb_image, 1.0 - alpha, 0)
        
        return overlaid_image
    except Exception as e:
        logger.error(f"Grad-CAM generation failed: {e}", exc_info=True)
        # Fallback: Return a tinted or placeholder version if something goes wrong
        fallback_img = original_rgb_image.copy()
        # Draw a red border to signify processing fallback
        cv2.rectangle(fallback_img, (0, 0), (fallback_img.shape[1], fallback_img.shape[0]), (255, 0, 0), 10)
        return fallback_img
