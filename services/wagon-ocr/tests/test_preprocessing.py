"""Unit tests for the in-memory image preprocessing pipeline."""

import io
import cv2
import numpy as np
import pytest
from PIL import Image

from app.preprocessing import (
    decode_image_with_exif,
    enhance_contrast_clahe,
    preprocess_image,
    resize_max_edge,
)


def create_test_image_bytes(width: int, height: int, color: tuple[int, int, int] = (255, 0, 0), exif_orientation: int | None = None) -> bytes:
    """Helper to synthesize uncompressed or JPEG image bytes in memory."""
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    if exif_orientation is not None:
        exif = img.getexif()
        exif[0x0112] = exif_orientation  # 0x0112 = 274 is the EXIF Orientation tag
        img.save(buf, format="JPEG", exif=exif)
    else:
        img.save(buf, format="PNG")
    return buf.getvalue()


def test_exif_orientation_correction():
    """Verify that EXIF orientation tag 6 (Rotate 90 CW) transposes dimensions."""
    # Create 120w x 60h image with EXIF tag 6
    img_bytes = create_test_image_bytes(120, 60, exif_orientation=6)
    bgr_arr = decode_image_with_exif(img_bytes)

    # After EXIF transpose, 120w x 60h rotated 90 degrees becomes 60w x 120h (height=120, width=60)
    h, w, c = bgr_arr.shape
    assert h == 120
    assert w == 60
    assert c == 3


def test_resize_max_edge_caps_large_images():
    """Verify that images larger than max_edge are downscaled preserving aspect ratio."""
    # 4000x2000 image
    large_img = np.zeros((2000, 4000, 3), dtype=np.uint8)
    resized, scale = resize_max_edge(large_img, max_edge=1920)

    h, w, _ = resized.shape
    assert max(h, w) == 1920
    assert w == 1920
    assert h == 960
    assert scale == pytest.approx(1920 / 4000, rel=1e-3)


def test_resize_max_edge_preserves_smaller_images():
    """Verify that images smaller than max_edge are not scaled up."""
    small_img = np.zeros((600, 800, 3), dtype=np.uint8)
    resized, scale = resize_max_edge(small_img, max_edge=1920)

    h, w, _ = resized.shape
    assert h == 600
    assert w == 800
    assert scale == 1.0


def test_enhance_contrast_clahe():
    """Verify that CLAHE enhancement returns a valid 3-channel BGR numpy array."""
    test_img = np.full((100, 100, 3), 128, dtype=np.uint8)
    enhanced = enhance_contrast_clahe(test_img)

    assert isinstance(enhanced, np.ndarray)
    assert enhanced.shape == (100, 100, 3)
    assert enhanced.dtype == np.uint8


def test_preprocess_corrupted_image_raises_value_error():
    """Verify that invalid/corrupt image bytes raise a ValueError."""
    corrupted_bytes = b"NOT_A_VALID_IMAGE_DATA_STREAM"

    with pytest.raises(ValueError) as exc_info:
        preprocess_image(corrupted_bytes)

    assert "Görsel çözümlenemedi" in str(exc_info.value) or "bozuk" in str(exc_info.value)
