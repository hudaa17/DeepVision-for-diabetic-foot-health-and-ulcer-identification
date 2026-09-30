"""
End-to-End Inference Demonstration Script
Simulates full pipeline execution (preprocessing, segmentation, inference, Grad-CAM, recommendations)
across test images from Grade 1 to Grade 4, printing the exact payload provided to the frontend.
"""

import os
import cv2
import json
import numpy as np
import tensorflow as tf
from app.ml.mobilenet import model_runner
from app.ml.preprocessing import apply_noise_reduction, apply_clahe_contrast_enhancement
from app.ml.segmentation import run_watershed_segmentation
from app.ml.gradcam import generate_gradcam_heatmap
from app.ml.recommendation import get_recommendations_for_risk

def run_demo():
    print("=" * 80)
    print(" CURAVISION: END-TO-END MODEL PIPELINE OUTPUT DEMONSTRATION")
    print("=" * 80)
    
    # 1. Initialize & load model
    model_runner.load()
    print(f"[*] Active Model        : {os.path.basename(model_runner.model_path)}")
    print(f"[*] Architecture Type   : {'VGG16 Deep Neural Network' if model_runner.is_vgg else 'MobileNetV2'}")
    print(f"[*] Recognized Classes  : {model_runner.class_labels}")
    print("=" * 80)

    test_samples = [
        ("Grade 1 (Superficial Ulcer / Pre-ulcerative)", "ml/dataset/test/Grade 1/112_jpg.rf.472615b206cdec5593b07c5716920e47.jpg"),
        ("Grade 2 (Deep Ulcer to Tendon/Capsule)", "ml/dataset/test/Grade 2/7_jpg.rf.9d42721e5267dd74b9b4a62dce8d7373.jpg"),
        ("Grade 3 (Deep Ulcer with Abscess/Infection)", "ml/dataset/test/Grade 3/405_jpg.rf.099192c104e44796e0d51387af02440c.jpg"),
        ("Grade 4 (Gangrene / Advanced Tissue Necrosis)", "ml/dataset/test/Grade 4/97_jpg.rf.e4a0aba14087b095be29b179b3a377d9.jpg")
    ]

    output_dir = "backend/uploads/demo_output"
    os.makedirs(output_dir, exist_ok=True)

    results = []

    for expected_label, rel_path in test_samples:
        img_path = os.path.join("..", rel_path) if not os.path.exists(rel_path) else rel_path
        if not os.path.exists(img_path):
            print(f"[!] Warning: Image not found: {img_path}")
            continue

        filename = os.path.basename(img_path)
        print(f"\n>>> PROCESSING CLINICAL IMAGE: {filename}")
        print(f"    Target Clinical Stage: {expected_label}")
        
        # Step A: Load and Preprocess Image
        raw_bgr = cv2.imread(img_path)
        raw_rgb = cv2.cvtColor(raw_bgr, cv2.COLOR_BGR2RGB)
        
        denoised = apply_noise_reduction(raw_rgb)
        enhanced = apply_clahe_contrast_enhancement(denoised)
        
        # Step B: Watershed Segmentation
        segmented_overlay, binary_mask = run_watershed_segmentation(raw_rgb)
        seg_out_path = os.path.join(output_dir, f"segmented_{filename}")
        cv2.imwrite(seg_out_path, cv2.cvtColor(segmented_overlay, cv2.COLOR_RGB2BGR))
        
        # Step C: Model Inference (using authentic clinical RGB image)
        predicted_class, confidence, probabilities = model_runner.predict(raw_rgb)
        
        # Step D: Grad-CAM Explainability Heatmap
        input_tensor = model_runner.prepare_tensor(raw_rgb)
        heatmap_overlay = generate_gradcam_heatmap(
            model=model_runner.model,
            preprocessed_tensor=input_tensor,
            original_rgb_image=raw_rgb
        )
        heat_out_path = os.path.join(output_dir, f"gradcam_{filename}")
        cv2.imwrite(heat_out_path, cv2.cvtColor(heatmap_overlay, cv2.COLOR_RGB2BGR))
        
        # Step E: Retrieve Clinical Guidelines
        recommendations = get_recommendations_for_risk(predicted_class)
        class_probs = {
            model_runner.class_labels[i]: round(float(p) * 100, 2)
            for i, p in enumerate(probabilities)
        }

        # Build Frontend JSON Response Contract
        frontend_payload = {
            "prediction_id": f"demo-pred-{filename[:8]}",
            "image_filename": filename,
            "predicted_risk_level": predicted_class,
            "confidence_score": round(confidence * 100, 2),
            "class_probability_distribution": class_probs,
            "clinical_urgency": recommendations.get("urgency", "low").upper(),
            "follow_up_window": recommendations.get("follow_up", "N/A"),
            "clinical_actions": recommendations.get("actions", []),
            "visual_assets": {
                "segmented_image": seg_out_path,
                "gradcam_heatmap": heat_out_path
            }
        }
        results.append(frontend_payload)

        # Print Clean Summary
        print(f"    [+] Model Prediction : {predicted_class.upper()}")
        print(f"    [+] Confidence Score : {confidence * 100:.2f}%")
        print(f"    [+] Class Breakdown  : {class_probs}")
        print(f"    [+] Clinical Urgency : {recommendations.get('urgency', 'low').upper()}")
        print(f"    [+] Follow-up Action : {recommendations.get('follow_up')}")
        print(f"    [+] Grad-CAM Heatmap : {heat_out_path}")
        print(f"    [+] Segmentation Map : {seg_out_path}")

    summary_file = os.path.join(output_dir, "demo_results.json")
    with open(summary_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print("\n" + "=" * 80)
    print(f"[+] All samples processed successfully! Results saved to {summary_file}")
    print("=" * 80)

if __name__ == "__main__":
    run_demo()
