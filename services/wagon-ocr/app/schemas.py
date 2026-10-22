"""Data schemas and contracts for Wagon OCR service."""

from pydantic import BaseModel, Field


class BBox(BaseModel):
    """Bounding box coordinates [x1, y1, x2, y2] relative to the processed image."""

    x1: int = Field(..., description="Left coordinate")
    y1: int = Field(..., description="Top coordinate")
    x2: int = Field(..., description="Right coordinate")
    y2: int = Field(..., description="Bottom coordinate")


class OcrLine(BaseModel):
    """Recognized line of text grouped from OCR bounding boxes."""

    text: str = Field(..., description="Extracted text string")
    confidence: float = Field(..., description="Conservative confidence score between 0.0 and 1.0")
    bbox: BBox = Field(..., description="Aggregated bounding box covering the entire line")


class WagonListResponse(BaseModel):
    """Provider-neutral response contract for OCR line extraction."""

    ok: bool = True
    processingTimeMs: int = Field(..., description="Server-side processing duration in milliseconds")
    processedWidth: int = Field(0, description="Processed image width in pixels")
    processedHeight: int = Field(0, description="Processed image height in pixels")
    lines: list[OcrLine] = Field(default_factory=list, description="Extracted text lines sorted top-to-bottom")
    warnings: list[str] = Field(default_factory=list, description="Operational warnings if any")


class HealthResponse(BaseModel):
    """Minimal health check response without exposing sensitive configuration."""

    status: str = "ok"
    ok: bool = True
    engine: str = Field(..., description="Identifier of the active OCR engine")
    version: str = "1.0.0"
    ready: bool = True


class ErrorResponse(BaseModel):
    """Structured error response."""

    ok: bool = False
    error: str = Field(..., description="Human-readable error description")
