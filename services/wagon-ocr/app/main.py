"""FastAPI application for RayBilgi Wagon OCR Service."""

import hmac
import time
from typing import Annotated

from fastapi import FastAPI, File, Header, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from .config import ALLOWED_MIME_TYPES, ENGINE_NAME, MAX_IMAGE_SIZE_BYTES, OCR_SECRET_KEY
from .ocr_engine import get_ocr_engine
from .preprocessing import preprocess_image
from .row_grouping import group_blocks_into_rows
from .schemas import HealthResponse, WagonListResponse

app = FastAPI(
    title="RayBilgi Wagon OCR Service",
    description="Deterministic local OCR microservice for railway document and photo recognition.",
    version="1.0.0",
)


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Minimal unauthenticated health check endpoint without exposing sensitive configuration."""
    return HealthResponse(status="ok", ok=True, engine=ENGINE_NAME, version="1.0.0", ready=True)


@app.post(
    "/wagon-list",
    response_model=WagonListResponse,
    responses={
        400: {"description": "Invalid image or unsupported format"},
        403: {"description": "Invalid or missing OCR secret header"},
        500: {"description": "Internal OCR processing error"},
    },
)
async def extract_wagon_list(
    image: Annotated[UploadFile, File(description="Railway photo/document (JPEG, PNG, WebP up to 8MB)")],
    x_ocr_secret: Annotated[str | None, Header(alias="X-OCR-Secret")] = None,
) -> WagonListResponse:
    """
    Extracts text lines and bounding boxes from an uploaded railway document photo.

    CRITICAL BOUNDARIES:
    - Service-to-service authenticated via X-OCR-Secret.
    - Ephemeral memory processing: Zero disk persistence, zero database writes.
    - Provider-neutral line extraction: NO tare, NO wagon type, NO axles, NO railway technical data.
    """
    # 1. Service authentication (constant-time comparison)
    if not x_ocr_secret or not hmac.compare_digest(x_ocr_secret, OCR_SECRET_KEY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Yetkisiz servis erişimi: X-OCR-Secret geçersiz veya eksik.",
        )

    # 2. File presence & MIME validation
    if not image or not image.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Görsel dosyası yüklenmedi.",
        )

    content_type = (image.content_type or "").lower().split(";")[0].strip()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Desteklenmeyen dosya türü ({content_type}). Yalnızca JPEG, PNG veya WebP kabul edilir.",
        )

    # 3. Read image bytes into RAM (ephemeral, bounded by 8 MB)
    content = await image.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Yüklenen görsel dosyası boş.",
        )

    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dosya boyutu {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)} MB sınırını aşıyor.",
        )

    start_time = time.perf_counter()

    # 4. In-memory preprocessing (EXIF, resize, CLAHE)
    try:
        processed_img, _ = preprocess_image(content, enhance_contrast=True)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        ) from err
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Görsel ön işleme hatası: {err}",
        ) from err

    # 5. Local OCR extraction (RapidOCR / PP-OCR ONNX on CPU)
    try:
        engine = get_ocr_engine()
        blocks = engine.recognize(processed_img)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OCR tanıma motoru hatası: {err}",
        ) from err

    # 6. Row clustering and horizontal sorting
    lines = group_blocks_into_rows(blocks)

    elapsed_ms = int(round((time.perf_counter() - start_time) * 1000))

    return WagonListResponse(
        ok=True,
        processingTimeMs=elapsed_ms,
        lines=lines,
        warnings=[],
    )
