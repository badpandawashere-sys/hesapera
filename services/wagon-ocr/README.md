# RayBilgi Wagon OCR Service

Deterministic, local, self-hosted OCR microservice designed for railway document and photo recognition.

This service replaces external generative AI (Gemini Vision) and cloud OCR APIs with a fast, self-hosted, CPU-only OCR pipeline based on the PP-OCRv4 ONNX model family.

---

## 🔒 Architectural Boundaries & Privacy

1. **OCR Only (Neutral Extraction):**
   - The service extracts characters, bounding boxes, and confidence scores only.
   - **Zero domain calculation:** This service NEVER calculates tare, wagon type, axles, train length, brake percentages, or any technical railway parameters.
   - Domain resolution and validation are exclusively handled downstream by canonical RayBilgi engines (`lib/raybilgi/wagon-tare.ts` & `wagon-reference.ts`).

2. **Ephemeral In-Memory Processing:**
   - Uploaded images are read directly into RAM and processed in-memory.
   - Zero disk persistence: No images, intermediate tensors, or temporary files are saved to disk.
   - Zero database logging: No image payloads or base64 strings are stored in databases or logs.

3. **Service-to-Service Security:**
   - All OCR requests require authentication via the `X-OCR-Secret` header matching `OCR_SECRET_KEY`.
   - Constant-time HMAC comparison prevents timing attacks.

---

## 🚀 Quickstart

### 1. Local Development (Python venv)

#### Prerequisites
- Python 3.10+ (tested on Python 3.11, 3.12, and 3.14)

#### Installation
```bash
# Navigate to the service directory
cd services/wagon-ocr

# Create and activate virtual environment
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Running the Service
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Running Tests
```bash
pytest -v
```

---

### 2. Docker Deployment

#### Build Image
```bash
docker build -t hesapera/wagon-ocr:latest services/wagon-ocr
```

#### Run Container
```bash
docker run -d \
  -p 8000:8000 \
  -e OCR_SECRET_KEY="production-secret-key-change-me" \
  --name wagon-ocr \
  hesapera/wagon-ocr:latest
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `OCR_SECRET_KEY` | Shared secret header required in `X-OCR-Secret` | `dev-wagon-ocr-secret-2026` |
| `WAGON_OCR_HOST` | Host address to bind the server | `127.0.0.1` |
| `WAGON_OCR_PORT` | Port number to bind the server | `8000` |

---

## 📡 API Contract

### `GET /health`
Liveness and readiness probe. Does not require authentication.

**Response (200 OK):**
```json
{
  "status": "ok",
  "ok": true,
  "engine": "RapidOCR-ONNX (PP-OCRv4)",
  "version": "1.0.0",
  "ready": true
}
```

---

### `POST /wagon-list`
Extracts text lines and bounding boxes from an uploaded railway document photo.

**Headers:**
- `X-OCR-Secret`: Required shared secret string matching `OCR_SECRET_KEY`.

**Form Data:**
- `image`: Multipart file upload (JPEG, PNG, or WebP; maximum 8 MB).

**Response (200 OK):**
```json
{
  "ok": true,
  "processingTimeMs": 273,
  "lines": [
    {
      "text": "REJIM SERI VAGON NO VARIS",
      "confidence": 0.9182,
      "bbox": { "x1": 59, "y1": 60, "x2": 215, "y2": 73 }
    },
    {
      "text": "3175 2461 776-8 KAYSERI",
      "confidence": 0.7959,
      "bbox": { "x1": 59, "y1": 131, "x2": 207, "y2": 142 }
    }
  ],
  "warnings": []
}
```

**Status Codes:**
- `200 OK`: Successful OCR extraction.
- `400 Bad Request`: Missing file, non-image format, file > 8MB, or unreadable/corrupted bytes.
- `403 Forbidden`: Missing or incorrect `X-OCR-Secret`.
- `500 Internal Server Error`: Server-side processing failure.
