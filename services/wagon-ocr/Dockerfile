FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000

# Install minimal OS runtime dependencies for OpenCV headless and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Warmup OCR engine during image build to pre-bundle ONNX models inside the container
RUN python -c "from rapidocr import RapidOCR; RapidOCR()"

# Copy application source code
COPY app/ ./app/

# Create and switch to non-privileged application user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app /home/appuser
USER appuser

# Healthcheck probe against internal endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
