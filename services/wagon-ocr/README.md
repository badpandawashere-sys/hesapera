# RayBilgi Wagon OCR Service

Deterministic, high-speed, self-hosted CPU OCR microservice designed for European and Turkish railway freight wagon identification markings, Saha Vaziyeti documents, and wagon lists.

---

## 🏗️ Architecture & Production Pipeline

```
Browser (photo-input.tsx)
  │ (Client-side downscale to max 1920px canvas)
  ▼
Next.js API (/raybilgi/vagon-dara/analyze-image)
  │ (Auth check, MIME/8MB check, ephemeral memory buffer)
  ▼
Wagon OCR Microservice (POST /wagon-list via ocr-client.ts)
  │ (X-OCR-Secret auth, EXIF orientation, CLAHE, RapidOCR PP-OCRv6 ONNX CPU)
  ▼
Provider-Neutral OCR Text Lines & Confidence
  │
  ▼
RayBilgi Deterministic Parser (parseSingleDaraLine / parsePasteForDara)
  │
  ▼
Canonical Reference Lookup (vagon_data.json -> tech_data -> user_data)
  │
  ▼
Exact Tare, Axle, Length, Wagon Type (Zero Generative AI)
```

---

## 🔒 Architectural Boundaries & Privacy

1. **OCR Only (Neutral Character Extraction):**
   - The Python service returns character lines, conservative confidence scores, and bounding boxes only.
   - **Zero railway domain calculations:** This service NEVER calculates tare weight (dara), wagon type, axle count, train length, brake percentage, or canonical serials.
   - Technical values are calculated exclusively downstream by the canonical RayBilgi JSON database.

2. **Ephemeral In-Memory Processing:**
   - Uploaded images are read directly into memory buffers and decoded as OpenCV/NumPy arrays in RAM.
   - **Zero disk persistence:** Images, crops, base64 strings, and intermediate files are never written to disk, databases, or logs.

3. **Service Authentication:**
   - All requests require the `X-OCR-Secret` header matching the environment variable `OCR_SECRET_KEY`.
   - Constant-time HMAC comparison prevents timing attacks.

---

## ⚡ Technical Specifications

- **Engine:** RapidOCR (`rapidocr` 3.10+ with `onnxruntime` CPU)
- **Models:** Bundled PP-OCRv6 small models (`PP-OCRv6_det_small.onnx`, `ch_ppocr_mobile_v2.0_cls_mobile.onnx`, `PP-OCRv6_rec_small.onnx`)
- **Process Model:** Single application worker (Uvicorn 1 worker) to prevent model duplication in RAM
- **Lifecycle:** Singleton engine initialized once during application startup (FastAPI lifespan)
- **Speed:** ~790 ms cold engine load, < 1.0 s warm OCR inference on CPU

---

## 📡 API Endpoints

### 1. `GET /health`
Liveness check returning service and engine state.
```json
{
  "status": "ok",
  "ok": true,
  "engine": "RapidOCR-ONNX (PP-OCRv6)",
  "version": "1.0.0",
  "ready": true
}
```

### 2. `GET /ready`
Readiness check verifying that OCR models are loaded in memory.
- `200 OK`: Model ready for inference.
- `503 Service Unavailable`: Model still loading or unavailable.

### 3. `POST /wagon-list`
Multipart form-data endpoint accepting a railway photo.
- **Header:** `X-OCR-Secret: <OCR_SECRET_KEY>`
- **Field:** `image` (JPEG, PNG, WebP up to 8 MB)
- **Response:**
```json
{
  "ok": true,
  "processingTimeMs": 973,
  "processedWidth": 900,
  "processedHeight": 400,
  "lines": [
    {
      "text": "3175 2461 776-8 KAYSERI 25,5",
      "confidence": 0.9679,
      "bbox": {
        "x1": 50,
        "y1": 100,
        "x2": 450,
        "y2": 140
      }
    }
  ],
  "warnings": []
}
```

---

## 🚀 Railway Deployment Guide

1. In Railway, create a new service connected to this repository.
2. Under **Settings**:
   - **Root Directory:** `services/wagon-ocr`
   - **Build:** Dockerfile (`Dockerfile`)
   - **Healthcheck Path:** `/health`
   - **Restart Policy:** On Failure (3 retries)
3. Under **Variables**:
   - Add `OCR_SECRET_KEY=<generate-strong-random-hex>`
4. Deploy the service and generate a public Railway domain (e.g. `https://wagon-ocr-production.up.railway.app`).
5. In Vercel / Next.js environment variables:
   - `WAGON_OCR_API_URL=https://wagon-ocr-production.up.railway.app`
   - `WAGON_OCR_API_SECRET=<same-secret-as-OCR_SECRET_KEY>`
