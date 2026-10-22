"""FastAPI application for RayBilgi Wagon OCR Service."""

from contextlib import asynccontextmanager
import hmac
import time
import threading
from typing import Annotated

from fastapi import FastAPI, File, Header, HTTPException, UploadFile, status, Request
from starlette.concurrency import run_in_threadpool

from .config import ALLOWED_MIME_TYPES, ENGINE_NAME, MAX_IMAGE_SIZE_BYTES, OCR_SECRET_KEY
from .ocr_engine import get_ocr_engine, is_engine_ready
from .preprocessing import preprocess_image
from .row_grouping import group_blocks_into_rows
from .schemas import HealthResponse, WagonListResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes singleton OCR engine once at application startup."""
    try:
        get_ocr_engine()
    except Exception as exc:
        # Engine will be re-attempted on request if startup failed
        pass
    yield


app = FastAPI(
    title="RayBilgi Wagon OCR Service",
    description="Deterministic local OCR microservice for railway document and photo recognition.",
    version="1.0.0",
    lifespan=lifespan,
)

_recognition_lock = threading.Lock()


def process_image_bytes(content: bytes) -> WagonListResponse:
    """Core image OCR pipeline: strictly in-memory, bounded, and provider-neutral."""
    # Serialize the shared ONNX engine; reject overload rather than building an unbounded queue.
    if not _recognition_lock.acquire(blocking=False):
        raise HTTPException(status_code=503, detail="OCR servisi meşgul. Lütfen tekrar deneyin.")
    try:
        started = time.perf_counter()
        try:
            processed, _ = preprocess_image(content, enhance_contrast=True)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Görsel çözümlenemedi veya bozuk dosya formatı.") from exc

        try:
            h, w = processed.shape[:2]
            blocks = get_ocr_engine().recognize(processed)
            lines = group_blocks_into_rows(blocks)
        except Exception as exc:
            raise HTTPException(status_code=503, detail="OCR motoru kullanılamıyor.") from exc

        elapsed_ms = round((time.perf_counter() - started) * 1000)
        return WagonListResponse(
            ok=True,
            processingTimeMs=elapsed_ms,
            processedWidth=w,
            processedHeight=h,
            lines=lines,
            warnings=[] if lines else ["Görselde okunabilir metin bulunamadı."],
        )
    finally:
        _recognition_lock.release()


@app.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """Minimal unauthenticated health check endpoint without exposing sensitive configuration."""
    try:
        get_ocr_engine()
    except Exception as exc:
        raise HTTPException(status_code=503, detail="OCR motoru hazır değil.") from exc
    return HealthResponse(
        status="ok",
        ok=True,
        engine=ENGINE_NAME,
        version="1.0.0",
        ready=is_engine_ready(),
    )


@app.get("/ready", response_model=HealthResponse)
def ready_check() -> HealthResponse:
    """Readiness probe verifying the OCR models are loaded and available in memory."""
    if not is_engine_ready():
        try:
            get_ocr_engine()
        except Exception:
            raise HTTPException(status_code=503, detail="OCR motoru hazır değil.")
    return HealthResponse(
        status="ok",
        ok=True,
        engine=ENGINE_NAME,
        version="1.0.0",
        ready=True,
    )


@app.post(
    "/wagon-list",
    response_model=WagonListResponse,
    responses={
        400: {"description": "Invalid image or unsupported format"},
        403: {"description": "Invalid or missing OCR secret header"},
        500: {"description": "Internal OCR processing error"},
        503: {"description": "Service busy or engine unavailable"},
    },
)
async def extract_wagon_list(
    image: Annotated[UploadFile, File(description="Railway photo/document (JPEG, PNG, WebP up to 8MB)")],
    x_ocr_secret: Annotated[str | None, Header(alias="X-OCR-Secret")] = None,
) -> WagonListResponse:
    """
    Extracts text lines and bounding boxes from an uploaded railway document photo.

    CRITICAL ARCHITECTURAL BOUNDARIES:
    - Service-to-service authenticated via X-OCR-Secret header.
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
    content = await image.read(MAX_IMAGE_SIZE_BYTES + 1)

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

    return await run_in_threadpool(process_image_bytes, content)


@app.post("/recognize", response_model=WagonListResponse)
async def recognize_raw(
    request: Request,
    x_ocr_secret: Annotated[str | None, Header(alias="X-OCR-Secret")] = None,
) -> WagonListResponse:
    """Raw bounded image body endpoint for streaming clients."""
    if not x_ocr_secret or not hmac.compare_digest(x_ocr_secret, OCR_SECRET_KEY):
        raise HTTPException(status_code=403, detail="Yetkisiz servis erişimi.")
    content_type = request.headers.get("content-type", "").split(";")[0].lower()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dosya türü.")

    content = bytearray()
    async for chunk in request.stream():
        if len(content) + len(chunk) > MAX_IMAGE_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Dosya boyutu 8 MB sınırını aşıyor.")
        content.extend(chunk)

    if not content:
        raise HTTPException(status_code=400, detail="Görsel dosyası boş.")

    return await run_in_threadpool(process_image_bytes, bytes(content))
