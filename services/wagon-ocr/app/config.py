"""Configuration settings for the Wagon OCR service."""

import os

# Security: Shared secret header for service-to-service authentication
OCR_SECRET_KEY: str = os.getenv("OCR_SECRET_KEY", "dev-wagon-ocr-secret-2026")

# Server binding
HOST: str = os.getenv("WAGON_OCR_HOST", "127.0.0.1")
PORT: int = int(os.getenv("WAGON_OCR_PORT", "8000"))

# Request validation limits
MAX_IMAGE_SIZE_BYTES: int = 8 * 1024 * 1024  # 8 MB
ALLOWED_MIME_TYPES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

# Image preprocessing limits
MAX_LONG_EDGE: int = 1920

ENGINE_NAME: str = "RapidOCR-ONNX (PP-OCRv6)"
