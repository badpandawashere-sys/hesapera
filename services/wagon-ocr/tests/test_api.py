"""Integration tests for FastAPI endpoints in app.main."""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.config import OCR_SECRET_KEY
from app.main import app

client = TestClient(app)

FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "synthetic_railway_table.png"


def test_post_wagon_list_without_secret_returns_403():
    """Verify that omitting X-OCR-Secret returns 403 Forbidden."""
    response = client.post(
        "/wagon-list",
        files={"image": ("test.png", b"\x89PNG\r\n\x1a\nfake", "image/png")},
    )
    assert response.status_code == 403
    assert "Yetkisiz" in response.text or "X-OCR-Secret" in response.text


def test_post_wagon_list_with_invalid_secret_returns_403():
    """Verify that providing an incorrect X-OCR-Secret returns 403 Forbidden."""
    response = client.post(
        "/wagon-list",
        headers={"X-OCR-Secret": "invalid-secret-key-123"},
        files={"image": ("test.png", b"\x89PNG\r\n\x1a\nfake", "image/png")},
    )
    assert response.status_code == 403
    assert "Yetkisiz" in response.text or "X-OCR-Secret" in response.text


def test_post_wagon_list_with_unsupported_mime_type_returns_400():
    """Verify that non-image MIME types return 400 Bad Request."""
    response = client.post(
        "/wagon-list",
        headers={"X-OCR-Secret": OCR_SECRET_KEY},
        files={"image": ("document.pdf", b"%PDF-1.5 test document", "application/pdf")},
    )
    assert response.status_code == 400
    assert "Desteklenmeyen dosya türü" in response.text


def test_post_wagon_list_exceeding_max_file_size_returns_400():
    """Verify that images larger than 8MB return 400 Bad Request."""
    large_payload = b"0" * (8 * 1024 * 1024 + 100)
    response = client.post(
        "/wagon-list",
        headers={"X-OCR-Secret": OCR_SECRET_KEY},
        files={"image": ("large.jpg", large_payload, "image/jpeg")},
    )
    assert response.status_code == 400
    assert "sınırını aşıyor" in response.text


def test_post_wagon_list_with_corrupted_image_returns_400():
    """Verify that corrupted image bytes return 400 Bad Request."""
    corrupt_bytes = b"CORRUPTED_PNG_HEADER_DATA_12345"
    response = client.post(
        "/wagon-list",
        headers={"X-OCR-Secret": OCR_SECRET_KEY},
        files={"image": ("corrupted.png", corrupt_bytes, "image/png")},
    )
    assert response.status_code == 400
    assert "çözümlenemedi" in response.text or "bozuk" in response.text


def test_post_wagon_list_with_valid_image_returns_neutral_json():
    """Verify end-to-end OCR processing returns neutral lines with bbox and NO railway technical fields."""
    assert FIXTURE_PATH.exists(), f"Fixture missing at {FIXTURE_PATH}"

    with open(FIXTURE_PATH, "rb") as f:
        img_bytes = f.read()

    response = client.post(
        "/wagon-list",
        headers={"X-OCR-Secret": OCR_SECRET_KEY},
        files={"image": ("synthetic_railway_table.png", img_bytes, "image/png")},
    )

    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()

    assert data["ok"] is True
    assert isinstance(data["processingTimeMs"], int)
    assert data["processingTimeMs"] >= 0
    assert isinstance(data["lines"], list)
    assert len(data["lines"]) > 0

    # Verify line structure
    for line in data["lines"]:
        assert "text" in line
        assert "confidence" in line
        assert "bbox" in line
        assert 0.0 <= line["confidence"] <= 1.0
        bbox = line["bbox"]
        assert bbox["x1"] <= bbox["x2"]
        assert bbox["y1"] <= bbox["y2"]

        # STRICT CONTRACT: Zero railway technical fields in line object
        for forbidden in ["tare", "dara", "wagon_type", "vagon_tipi", "axle", "dingil", "length", "boy", "brake", "fren"]:
            assert forbidden not in line, f"Line contains technical railway field: {forbidden}"

    # STRICT CONTRACT: Zero railway technical fields in top-level response
    for forbidden in ["tare", "dara", "wagon_type", "vagon_tipi", "axle", "dingil", "length", "boy", "brake", "fren"]:
        assert forbidden not in data, f"Response contains technical railway field: {forbidden}"
