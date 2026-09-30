# Diabetic Foot Ulcer Dataset Directory

Place your foot images in the corresponding class folders below:

### 4-Grade Classification (Wound Severity System):
```text
ml/dataset/
└── test/
    ├── Grade 1/    <-- Superficial ulcer / pre-ulcerative lesion
    ├── Grade 2/    <-- Deep ulcer to tendon or joint capsule
    ├── Grade 3/    <-- Deep ulcer with abscess, osteomyelitis, or joint sepsis
    └── Grade 4/    <-- Gangrene / advanced necrosis
```

### Alternatively (3-Tier Risk System):
```text
ml/dataset/
├── normal/     <-- Healthy / low-risk plantar foot images
├── mild/       <-- Pre-ulcerative lesions, calluses, early erythema
└── severe/     <-- Active diabetic ulcers, open wounds, tissue breakdown
```

### Supported Formats:
- `.jpg`, `.jpeg`, `.png`, `.bmp`
- Target input size: 224x224 (automatic preprocessing applies to images)

### Running Evaluation on Test Set:
```bash
python ml/training/evaluate.py --test_dir ml/dataset/test
```
This loads the active trained model, computes metrics on the test set, and reports overall and per-class accuracy.

### Running Training:
```bash
python ml/training/train.py --data_dir ml/dataset --epochs 25
```
