"""Deterministic in-memory image preprocessing pipeline for railway photo OCR."""

import io
import cv2
import numpy as np
from PIL import Image, ImageOps

from .config import MAX_LONG_EDGE


def decode_image_with_exif(image_bytes: bytes) -> np.ndarray:
    """
    Decodes an image from raw memory bytes while respecting EXIF orientation tags.
    Returns a BGR numpy array compatible with OpenCV.
    Raises ValueError if image decoding fails.
    """
    if not image_bytes:
        raise ValueError("Görsel verisi boş.")

    try:
        with Image.open(io.BytesIO(image_bytes)) as pil_img:
            # Correct EXIF orientation (handles mobile phone camera rotations)
            pil_img = ImageOps.exif_transpose(pil_img) or pil_img

            # Convert to RGB if palette/RGBA/CMYK
            if pil_img.mode != "RGB":
                pil_img = pil_img.convert("RGB")

            # Convert PIL RGB to OpenCV BGR numpy array
            rgb_arr = np.array(pil_img)
            bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
            return bgr_arr
    except Exception as exc:
        raise ValueError(f"Görsel çözümlenemedi veya bozuk dosya formatı: {exc}") from exc


def resize_max_edge(image: np.ndarray, max_edge: int = MAX_LONG_EDGE) -> tuple[np.ndarray, float]:
    """
    Resizes an image preserving aspect ratio so that its longest edge is at most max_edge.
    Returns (resized_image, scale_factor).
    If image is already smaller than max_edge, it is returned without modification (scale=1.0).
    """
    h, w = image.shape[:2]
    long_edge = max(h, w)

    if long_edge <= max_edge:
        return image, 1.0

    scale = max_edge / float(long_edge)
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))

    # Use INTER_AREA for downsampling
    resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return resized, scale


def enhance_contrast_clahe(image: np.ndarray) -> np.ndarray:
    """
    Applies Contrast Limited Adaptive Histogram Equalization (CLAHE) on the L-channel of LAB space.
    Enhances contrast across uneven phone shadows and screen glare without introducing harsh artifacts.
    """
    # Convert BGR to LAB
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)

    # Apply CLAHE to L-channel
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)

    # Merge channels and convert back to BGR
    merged = cv2.merge([l_enhanced, a_channel, b_channel])
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


def preprocess_image(
    image_bytes: bytes,
    max_edge: int = MAX_LONG_EDGE,
    enhance_contrast: bool = True,
) -> tuple[np.ndarray, float]:
    """
    Complete minimal in-memory preprocessing pipeline:
    1. EXIF orientation correction and memory decode
    2. Aspect-preserving resize (long edge capped at max_edge)
    3. Optional CLAHE contrast enhancement
    Returns (processed_image, scale_factor).
    """
    img = decode_image_with_exif(image_bytes)
    resized, scale = resize_max_edge(img, max_edge=max_edge)

    if enhance_contrast:
        processed = enhance_contrast_clahe(resized)
    else:
        processed = resized

    return processed, scale
