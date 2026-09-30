"""
CuraVision - Model Evaluation Script
Evaluates trained models (VGG16, MobileNetV2) against the test dataset and outputs metrics.
"""

import os
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate Diabetic Foot Model")
    parser.add_argument("--model_path", type=str, default="ml/saved_models/VGG16_DFU_Grade_Classifier_FINAL.keras", help="Path to trained model")
    parser.add_argument("--test_dir", type=str, default="ml/dataset/test", help="Path to test images directory")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--img_size", type=int, default=224, help="Image size")
    return parser.parse_args()

def resolve_model_file(preferred_path: str) -> str:
    candidates = [
        preferred_path,
        "ml/saved_models/VGG16_DFU_Grade_Classifier_FINAL.keras",
        "ml/saved_models/best_model.keras",
        "backend/uploads/models/VGG16_DFU_Grade_Classifier_FINAL.keras",
        "backend/uploads/models/diabetic_foot_mobilenetv2.keras",
        "ml/saved_models/diabetic_foot_mobilenetv2.keras",
        "ml/saved_models/mobilenet_model.h5"
    ]
    for p in candidates:
        if os.path.isfile(p) and os.path.getsize(p) > 1024:
            return p
    return preferred_path

def main():
    args = parse_args()
    model_path = resolve_model_file(args.model_path)

    if not os.path.exists(model_path) or os.path.getsize(model_path) <= 1024:
        print(f"[!] Error: Model file not found at {model_path}")
        return

    if not os.path.exists(args.test_dir):
        print(f"[!] Error: Test directory not found at {args.test_dir}")
        print(f"    Expected test subfolders in {args.test_dir}/")
        return

    print("=" * 60)
    print(" CuraVision: Test Evaluation Pipeline")
    print("=" * 60)
    print(f"[*] Loading model from {model_path} ({os.path.getsize(model_path) / (1024*1024):.1f} MB)...")
    model = load_model(model_path)

    is_vgg = any("block" in layer.name.lower() for layer in model.layers) or "vgg" in os.path.basename(model_path).lower()
    print(f"[*] Detected architecture: {'VGG16' if is_vgg else 'MobileNet / Custom'}")

    print(f"[*] Loading test images from {args.test_dir}...")
    test_ds = tf.keras.utils.image_dataset_from_directory(
        args.test_dir,
        image_size=(args.img_size, args.img_size),
        batch_size=args.batch_size,
        label_mode="categorical",
        shuffle=False
    )
    class_names = test_ds.class_names
    print(f"[+] Identified classes ({len(class_names)}): {class_names}")

    # Apply appropriate architecture preprocessing
    if is_vgg:
        print("[*] Applying VGG16 ImageNet mean subtraction preprocessing...")
        eval_ds = test_ds.map(lambda x, y: (tf.keras.applications.vgg16.preprocess_input(x), y))
    else:
        print("[*] Applying [-1, 1] normalization preprocessing...")
        eval_ds = test_ds.map(lambda x, y: ((x / 127.5) - 1.0, y))

    print("[*] Evaluating dataset...")
    results = model.evaluate(eval_ds, verbose=1)
    
    metric_names = model.metrics_names
    print("\n" + "=" * 60)
    print(" Overall Test Evaluation Metrics:")
    print("=" * 60)
    for name, val in zip(metric_names, results):
        print(f"  - {name.capitalize():15s}: {val:.4f}")

    # Compute per-class accuracy and confusion matrix
    all_preds = []
    all_labels = []
    for images, labels in eval_ds:
        preds = model.predict(images, verbose=0)
        all_preds.extend(np.argmax(preds, axis=1))
        all_labels.extend(np.argmax(labels.numpy(), axis=1))

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    total_acc = np.mean(all_preds == all_labels) * 100.0
    print("-" * 60)
    print(f" Total Accuracy: {total_acc:.2f}% ({np.sum(all_preds == all_labels)}/{len(all_labels)} correct)")
    print("-" * 60)
    print(" Per-Class Breakdown:")
    for idx, cname in enumerate(class_names):
        mask = (all_labels == idx)
        if np.sum(mask) > 0:
            c_acc = np.mean(all_preds[mask] == idx) * 100.0
            print(f"  - {cname:15s}: {np.sum(all_preds[mask] == idx)}/{np.sum(mask)} ({c_acc:.1f}%)")
    print("=" * 60)

if __name__ == "__main__":
    main()
