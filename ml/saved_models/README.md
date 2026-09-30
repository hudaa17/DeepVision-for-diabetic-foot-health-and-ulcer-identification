# Trained Model Directory

Place your pre-trained model weights file here.

### Active Integrated Model:
- `VGG16_DFU_Grade_Classifier_FINAL.keras` (156.8 MB)
  - **Base Architecture**: VGG16 Transfer Learning
  - **Input Dimensions**: `(224, 224, 3)` (RGB)
  - **Preprocessing**: `tf.keras.applications.vgg16.preprocess_input`
  - **Output Layer**: 4 Softmax Classes:
    - `0`: `"Grade 1"`
    - `1`: `"Grade 2"`
    - `2`: `"Grade 3"`
    - `3`: `"Grade 4"`

### Supported File Names & Formats:
- `VGG16_DFU_Grade_Classifier_FINAL.keras`
- `best_model.keras`
- `diabetic_foot_mobilenetv2.keras`
- `mobilenet_model.h5`

### Auto-Discovery:
The CuraVision backend automatically searches for models in:
1. `backend/uploads/models/VGG16_DFU_Grade_Classifier_FINAL.keras`
2. `backend/uploads/models/diabetic_foot_mobilenetv2.keras`
3. `ml/saved_models/VGG16_DFU_Grade_Classifier_FINAL.keras`
4. `ml/saved_models/best_model.keras`
5. Custom path configured in `backend/.env` via `MODEL_PATH`

If no trained model file is present (or file size is 0 bytes), the system automatically compiles a baseline MobileNetV2 architecture with ImageNet weights.
