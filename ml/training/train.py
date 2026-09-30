"""
CuraVision - Diabetic Foot Ulcer Identification Training Pipeline
Trains a MobileNetV2 transfer learning model on foot image datasets.
Exports model to ml/saved_models/ and automatically copies to backend/uploads/models/.
"""

import os
import sys
import json
import shutil
import argparse
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, RandomFlip, RandomRotation, RandomZoom, Rescaling
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

def parse_args():
    parser = argparse.ArgumentParser(description="Train MobileNetV2 for Diabetic Foot Ulcer Risk Assessment")
    parser.add_argument("--data_dir", type=str, default="ml/dataset", help="Path to dataset directory")
    parser.add_argument("--epochs", type=int, default=25, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size")
    parser.add_argument("--img_size", type=int, default=224, help="Image input dimension (224x224)")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate for Adam optimizer")
    parser.add_argument("--val_split", type=float, default=0.2, help="Validation split fraction if not pre-split")
    parser.add_argument("--output_dir", type=str, default="ml/saved_models", help="Directory to save trained model")
    parser.add_argument("--sync_to_backend", action="store_true", default=True, help="Sync trained model to backend uploads")
    return parser.parse_args()

def load_datasets(data_dir: str, img_size: int, batch_size: int, val_split: float):
    if not os.path.exists(data_dir):
        raise FileNotFoundError(
            f"Dataset directory '{data_dir}' not found.\n"
            f"Please create the directory and place your labeled images in:\n"
            f"  {data_dir}/normal/\n"
            f"  {data_dir}/mild/\n"
            f"  {data_dir}/severe/\n"
            f"Or with train/val splits:\n"
            f"  {data_dir}/train/\n"
            f"  {data_dir}/val/\n"
        )

    train_path = os.path.join(data_dir, "train")
    val_path = os.path.join(data_dir, "val")

    image_size = (img_size, img_size)

    if os.path.isdir(train_path) and os.path.isdir(val_path):
        print(f"[*] Found pre-split 'train' and 'val' subdirectories in {data_dir}")
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_path,
            image_size=image_size,
            batch_size=batch_size,
            label_mode="categorical",
            shuffle=True,
            seed=42
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            val_path,
            image_size=image_size,
            batch_size=batch_size,
            label_mode="categorical",
            shuffle=False
        )
        class_names = train_ds.class_names
    else:
        print(f"[*] Loading dataset from {data_dir} with {int(val_split*100)}% validation split")
        train_ds = tf.keras.utils.image_dataset_from_directory(
            data_dir,
            validation_split=val_split,
            subset="training",
            seed=42,
            image_size=image_size,
            batch_size=batch_size,
            label_mode="categorical"
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            data_dir,
            validation_split=val_split,
            subset="validation",
            seed=42,
            image_size=image_size,
            batch_size=batch_size,
            label_mode="categorical"
        )
        class_names = train_ds.class_names

    print(f"[+] Detected {len(class_names)} classes: {class_names}")
    
    # Performance optimization: cache and prefetch
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.cache().prefetch(buffer_size=autotune)
    val_ds = val_ds.cache().prefetch(buffer_size=autotune)

    return train_ds, val_ds, class_names

def build_model(num_classes: int, img_size: int = 224, lr: float = 1e-4) -> Model:
    print("[*] Building MobileNetV2 architecture with transfer learning...")
    
    # Data Augmentation pipeline
    data_augmentation = tf.keras.Sequential([
        RandomFlip("horizontal"),
        RandomRotation(0.15),
        RandomZoom(0.1),
    ], name="augmentation_layers")

    # MobileNetV2 expects inputs in range [-1, 1]
    rescale_layer = Rescaling(1./127.5, offset=-1.0, name="mobilenetv2_rescale")

    inputs = tf.keras.Input(shape=(img_size, img_size, 3))
    x = data_augmentation(inputs)
    x = rescale_layer(x)

    # Base pretrained model
    base_model = MobileNetV2(
        input_shape=(img_size, img_size, 3),
        include_top=False,
        weights="imagenet"
    )
    base_model.trainable = False  # Freeze base layers for initial feature extraction

    x = base_model(x, training=False)
    x = GlobalAveragePooling2D(name="global_avg_pool")(x)
    x = Dense(128, activation="relu", name="dense_fc_1")(x)
    x = Dropout(0.3, name="dropout_fc")(x)
    outputs = Dense(num_classes, activation="softmax", name="predictions")(x)

    model = Model(inputs=inputs, outputs=outputs, name="DiabeticFoot_MobileNetV2")
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=lr),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.Precision(name="precision"), tf.keras.metrics.Recall(name="recall")]
    )
    return model

def main():
    args = parse_args()
    os.makedirs(args.output_dir, exist_ok=True)

    print("=" * 60)
    print(" CuraVision: Diabetic Foot Ulcer Model Training Pipeline")
    print("=" * 60)

    train_ds, val_ds, class_names = load_datasets(
        args.data_dir, args.img_size, args.batch_size, args.val_split
    )

    # Save class labels JSON
    labels_dict = {str(i): name for i, name in enumerate(class_names)}
    labels_path = os.path.join(args.output_dir, "labels.json")
    with open(labels_path, "w", encoding="utf-8") as f:
        json.dump(labels_dict, f, indent=2)
    print(f"[+] Saved class labels to: {labels_path}")

    model = build_model(len(class_names), args.img_size, args.lr)
    model.summary()

    best_model_path = os.path.join(args.output_dir, "best_model.keras")

    callbacks = [
        ModelCheckpoint(
            filepath=best_model_path,
            monitor="val_accuracy",
            save_best_only=True,
            mode="max",
            verbose=1
        ),
        EarlyStopping(
            monitor="val_loss",
            patience=6,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1
        )
    ]

    print(f"\n[*] Starting training for up to {args.epochs} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=callbacks
    )

    print("\n" + "=" * 60)
    print(f"[+] Training completed! Best model saved to: {best_model_path}")

    # Copy to backend/uploads/models so backend immediately finds it
    if args.sync_to_backend:
        backend_model_dir = os.path.join("backend", "uploads", "models")
        os.makedirs(backend_model_dir, exist_ok=True)
        dest_model_path = os.path.join(backend_model_dir, "diabetic_foot_mobilenetv2.keras")
        dest_labels_path = os.path.join(backend_model_dir, "labels.json")
        try:
            shutil.copyfile(best_model_path, dest_model_path)
            shutil.copyfile(labels_path, dest_labels_path)
            print(f"[+] Synced active model to backend: {dest_model_path}")
        except Exception as e:
            print(f"[!] Warning: Could not auto-sync model to backend: {e}")

    print("=" * 60)

if __name__ == "__main__":
    main()
