from pathlib import Path
from fastapi.testclient import TestClient
from app.main import app
from app.config import OCR_SECRET_KEY
from PIL import Image
import io

client = TestClient(app)
headers = {"X-OCR-Secret": OCR_SECRET_KEY, "Content-Type": "image/png"}


FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "synthetic_railway_table.png"


def test_raw_recognition_reads_all_three_fixture_rows():
    image = FIXTURE_PATH.read_bytes()
    response = client.post("/recognize", content=image, headers=headers)
    assert response.status_code == 200
    lines = response.json()["lines"]
    compact = [line["text"].replace(" ", "") for line in lines]
    for expected in ["31752461776-8", "31752752262-5", "21753302474-1"]:
        assert any(expected in line for line in compact), compact


def test_raw_endpoint_rejects_unauthorized_empty_corrupt_and_oversized():
    assert client.post("/recognize", content=b"x", headers={"Content-Type": "image/png"}).status_code == 403
    for payload in [b"", b"not an image", b"x" * (8 * 1024 * 1024 + 1)]:
        assert client.post("/recognize", content=payload, headers=headers).status_code == 400


def test_phone_style_exif_rotation_and_jpeg_keep_wagon_rows():
    # Synthetic fixture, not a real field photograph. Exercise the mobile EXIF path with real OCR.
    image = Image.open(FIXTURE_PATH).rotate(90, expand=True)
    exif = Image.Exif()
    exif[274] = 6
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG", quality=90, exif=exif)
    response = client.post("/recognize", content=buffer.getvalue(), headers={**headers, "Content-Type": "image/jpeg"})
    assert response.status_code == 200
    compact = [line["text"].replace(" ", "") for line in response.json()["lines"]]
    for expected in ["31752461776-8", "31752752262-5", "21753302474-1"]:
        assert any(expected in line for line in compact), compact


def test_readiness_fails_when_engine_cannot_load(monkeypatch):
    def broken():
        raise RuntimeError("private-path-do-not-expose")
    monkeypatch.setattr("app.main.get_ocr_engine", broken)
    response = client.get("/health")
    assert response.status_code == 503
    assert "private-path" not in response.text
