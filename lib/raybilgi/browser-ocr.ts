'use client';

import { createWorker, OEM, PSM } from 'tesseract.js';
import {
  parseSingleDaraLine,
  isHeaderLine,
  validateUicCheckDigit,
} from './vagon-dara-engine';
import type { ExtractedWagonIdentity } from './ocr-client';

export interface PreprocessMeta {
  originalWidth: number;
  originalHeight: number;
  processedWidth: number;
  processedHeight: number;
  scaleFactor: number;
}

export interface BrowserOcrResult {
  ok: boolean;
  wagons: ExtractedWagonIdentity[];
  count: number;
  warnings: string[];
  rawText: string;
  processingTimeMs: number;
  meta: PreprocessMeta;
}

export type OcrProgressCallback = (status: string, progress: number) => void;

/**
 * Checks if the current environment supports in-browser WebAssembly OCR.
 */
export function isBrowserOcrSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    typeof window.Worker !== 'undefined' &&
    typeof window.WebAssembly !== 'undefined' &&
    typeof window.createImageBitmap === 'function' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  );
}

/**
 * High-performance client-side image preprocessor:
 * 1. Intelligent scaling (upscales tiny tables for optimal 35-45px x-height; limits huge images to 2000px)
 * 2. 28px white margin padding to eliminate Leptonica border-clipping / box errors
 * 3. Grayscale conversion (ITU-R BT.601)
 * 4. Contrast normalization (stretches luminance distribution)
 * 5. Binarization / thresholding to remove faint table gridlines and pastel cell fills
 */
export async function preprocessImageForOcr(
  source: File | Blob
): Promise<{ canvas: HTMLCanvasElement; blob: Blob; meta: PreprocessMeta }> {
  if (typeof window === 'undefined') {
    throw new Error('Image preprocessing is only supported in browser environments.');
  }

  // Load image bitmap or element
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    // Fallback via Image element if createImageBitmap is not supported
    bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(source);
      img.onload = () => {
        URL.revokeObjectURL(url);
        createImageBitmap(img).then(resolve).catch(reject);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Görsel dosyası yüklenemedi.'));
      };
      img.src = url;
    });
  }

  const origW = bitmap.width;
  const origH = bitmap.height;

  // Determine scaling factor
  // Optimal line height for Tesseract is ~30-50px.
  // If an image is small (e.g. 214x210 with 13 rows -> 16px/row), upscale 3x.
  let scale = 1.0;
  if (origW < 400 || origH < 400) {
    scale = 3.0;
  } else if (origW < 900 || origH < 700) {
    scale = 2.0;
  } else if (Math.max(origW, origH) > 2200) {
    scale = 2000 / Math.max(origW, origH);
  }

  const scaledW = Math.round(origW * scale);
  const scaledH = Math.round(origH * scale);

  // Add 28px white border padding to prevent edge glyph truncation
  const pad = 28;
  const totalW = scaledW + pad * 2;
  const totalH = scaledH + pad * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalW;
  canvas.height = totalH;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas 2D context oluşturulamadı.');
  }

  // 1. Fill pure white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalW, totalH);

  // 2. High-quality smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, pad, pad, scaledW, scaledH);
  bitmap.close();

  // 3. Pixel manipulation: Grayscale, contrast stretch, thresholding
  const imgData = ctx.getImageData(0, 0, totalW, totalH);
  const data = imgData.data;
  const len = data.length;

  let minLum = 255;
  let maxLum = 0;

  // First pass: Grayscale and find min/max luminance
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Standard perceptual luminance formula
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    data[i] = lum;
    data[i + 1] = lum;
    data[i + 2] = lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  // Second pass: Contrast stretching & thresholding
  const lumRange = maxLum - minLum;
  const threshold = minLum + lumRange * 0.65; // adaptive cutoff

  for (let i = 0; i < len; i += 4) {
    const lum = data[i];
    if (lumRange > 40) {
      // Thresholding cleans pastel cell fills and faint table borders
      const val = lum < threshold ? (lum < minLum + lumRange * 0.3 ? 0 : 40) : 255;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Görsel Blob formatına dönüştürülemedi.'));
    }, 'image/png');
  });

  return {
    canvas,
    blob,
    meta: {
      originalWidth: origW,
      originalHeight: origH,
      processedWidth: totalW,
      processedHeight: totalH,
      scaleFactor: scale,
    },
  };
}

let cachedWorker: Tesseract.Worker | null = null;

/**
 * Gets an existing initialized worker singleton or creates a new one using local static assets.
 */
async function getOrCreateWorker(onProgress?: OcrProgressCallback): Promise<Tesseract.Worker> {
  if (cachedWorker) {
    return cachedWorker;
  }

  onProgress?.('OCR motoru yükleniyor...', 0.25);
  const worker = await createWorker('eng', OEM.LSTM_ONLY, {
    workerPath: '/tesseract/worker.min.js',
    corePath: '/tesseract',
    langPath: '/tesseract',
    gzip: true,
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        const pct = 0.35 + m.progress * 0.6;
        onProgress?.(`Vagon numaraları taranıyor (%${Math.round(m.progress * 100)})...`, pct);
      }
    },
  });

  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    tessedit_char_whitelist: '0123456789- ABCDEFGHIJKLMNOPQRSTUVWXYZİĞÜŞÖÇ/.\t\n',
  });

  cachedWorker = worker;
  return cachedWorker;
}

/**
 * Terminates the worker singleton and releases memory.
 */
export async function terminateBrowserOcr(): Promise<void> {
  if (cachedWorker) {
    const w = cachedWorker;
    cachedWorker = null;
    try {
      await w.terminate();
    } catch {
      // ignore termination errors
    }
  }
}

/**
 * Recognizes railway wagons in-browser using local Tesseract.js WebAssembly worker.
 * Self-contained: Loads worker and models strictly from local static `/tesseract/` assets.
 * Zero external CDN or network API dependencies.
 * Reuses worker across multiple uploads for sub-second recognition.
 */
export async function recognizeWagonsInBrowser(
  source: File | Blob,
  onProgress?: OcrProgressCallback
): Promise<BrowserOcrResult> {
  const startTime = Date.now();
  const warnings: string[] = [];

  // Step 1: Client Preprocessing
  onProgress?.('Görsel optimize ediliyor...', 0.1);
  const { canvas, meta } = await preprocessImageForOcr(source);

  // Step 2: Get or initialize worker singleton
  const worker = await getOrCreateWorker(onProgress);

  // Step 3: Perform local character recognition
  onProgress?.('Metin satırları çözümleniyor...', 0.7);
  const result = await worker.recognize(canvas);
  const rawText = result.data.text || '';

  // Step 4: Parse recognized lines with deterministic wagon engine
  onProgress?.('Vagon numaraları ve kontrol basamakları doğrulanıyor...', 0.95);
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const wagons: ExtractedWagonIdentity[] = [];

  for (const rawLine of lines) {
    if (isHeaderLine(rawLine)) continue;

    const parsed = parseSingleDaraLine(rawLine);
    if (!parsed) continue;

    const serial = parsed.serial || '';
    const wagonNo = parsed.wagonNo || '';
    const regime = parsed.regime || '';

    if (!serial && !wagonNo) continue;

    // Validate check digit
    const checkResult = validateUicCheckDigit(regime, serial, wagonNo);
    let confidenceWarning: string | undefined;

    if (checkResult.warning) {
      confidenceWarning = checkResult.warning;
    } else if (!wagonNo.includes('-') && wagonNo.length >= 4) {
      confidenceWarning = 'Okumayı kontrol edin';
    }

    wagons.push({
      rawText: rawLine,
      regime,
      serial,
      wagonNo,
      confidenceWarning,
    });
  }

  const duration = Date.now() - startTime;
  onProgress?.('Tamamlandı', 1.0);

  return {
    ok: true,
    wagons,
    count: wagons.length,
    warnings,
    rawText,
    processingTimeMs: duration,
    meta,
  };
}
