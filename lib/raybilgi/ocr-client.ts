import 'server-only';
import { z } from 'zod';
import { extractWagonIdentitiesWithGemini } from './gemini-vision';

export const OcrBBoxSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
});

export const OcrLineSchema = z.object({
  text: z.string(),
  confidence: z.number().optional(),
  bbox: OcrBBoxSchema.optional(),
});

export const OcrResponseSchema = z.object({
  ok: z.boolean(),
  processingTimeMs: z.number().optional().default(0),
  processedWidth: z.number().optional().default(0),
  processedHeight: z.number().optional().default(0),
  lines: z.array(OcrLineSchema).default([]),
  warnings: z.array(z.string()).default([]),
});

export type OcrLine = z.infer<typeof OcrLineSchema>;
export type OcrResponse = z.infer<typeof OcrResponseSchema>;

export interface ExtractedWagonIdentity {
  rawText: string;
  regime: string;
  serial: string;
  wagonNo: string;
  confidence?: number;
  confidenceWarning?: string;
}

export class OcrClientError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'OcrClientError';
  }
}

export const OCR_TIMEOUT_MS = 12_000;

/**
 * Calls remote RapidOCR service (e.g. self-hosted microservice on Railway or local host).
 */
export async function callRemoteRapidOcr(
  imageBytes: Uint8Array | Buffer | Blob | File,
  mimeType: string,
  apiUrl: string
): Promise<OcrResponse> {
  const secretKey =
    process.env.WAGON_OCR_API_SECRET || process.env.OCR_SECRET_KEY || '';

  const endpoint = new URL(
    'wagon-list',
    apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`
  );

  const formData = new FormData();
  if (imageBytes instanceof File) {
    formData.append('image', imageBytes, imageBytes.name);
  } else if (imageBytes instanceof Blob) {
    formData.append('image', imageBytes, 'upload.jpg');
  } else {
    const buffer = Buffer.isBuffer(imageBytes)
      ? imageBytes
      : Buffer.from(imageBytes as Uint8Array);
    const blob = new Blob([buffer as unknown as BlobPart], { type: mimeType });
    formData.append('image', blob, 'upload.jpg');
  }

  let response: Response;
  try {
    response = await fetch(endpoint.toString(), {
      method: 'POST',
      headers: {
        'X-OCR-Secret': secretKey,
      },
      body: formData,
      signal: AbortSignal.timeout(OCR_TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('aborted'))
    ) {
      throw new OcrClientError(
        'Fotoğraf okuma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.',
        504
      );
    }
    throw new OcrClientError(
      'Fotoğraf okuma servisine ulaşılamadı. Metin Yapıştır seçeneğini kullanabilirsiniz.',
      503
    );
  }

  if (response.status === 403) {
    throw new OcrClientError(
      'Yetkisiz servis erişimi: X-OCR-Secret geçersiz veya eksik.',
      403
    );
  }

  if (response.status === 400) {
    const errJson = await response.json().catch(() => ({}));
    throw new OcrClientError(
      errJson.detail || 'Desteklenmeyen görsel veya bozuk format.',
      400
    );
  }

  if (!response.ok) {
    throw new OcrClientError(
      'Fotoğraf okuma servisi şu anda kullanılamıyor. Lütfen tekrar deneyin.',
      response.status >= 500 ? 503 : response.status
    );
  }

  let rawJson: unknown;
  try {
    rawJson = await response.json();
  } catch {
    throw new OcrClientError(
      'Fotoğraf okuma servisinden geçersiz JSON yanıtı alındı.',
      502
    );
  }

  const parseResult = OcrResponseSchema.safeParse(rawJson);
  if (!parseResult.success) {
    throw new OcrClientError(
      'Fotoğraf okuma servis yanıtı şemaya uymuyor.',
      502
    );
  }

  return parseResult.data;
}

/**
 * Universal OCR orchestrator for RayBilgi:
 * - If an external RapidOCR service URL is explicitly configured and valid, attempts it first.
 * - If external service is not configured (or in production where WAGON_OCR_API_URL is omitted),
 *   or if the external service fails, automatically routes to Google Gemini Vision.
 * - Never returns fake or guessed numbers; adheres to strict validation.
 */
export async function recognizeWagonList(
  imageBytes: Uint8Array | Buffer | Blob | File,
  mimeType: string = 'image/jpeg'
): Promise<OcrResponse> {
  const customUrl = process.env.WAGON_OCR_API_URL?.trim();

  // In production, an empty URL or localhost fallback is not a valid remote service
  const isCustomConfigured =
    Boolean(customUrl) &&
    (process.env.NODE_ENV !== 'production' ||
      (!customUrl!.includes('127.0.0.1') && !customUrl!.includes('localhost')));

  let remoteError: unknown = null;

  if (isCustomConfigured) {
    try {
      return await callRemoteRapidOcr(imageBytes, mimeType, customUrl!);
    } catch (err: unknown) {
      remoteError = err;
      console.warn(
        'Harici OCR servisi başarısız oldu, Gemini Vision yedek mekanizması çalıştırılıyor:',
        err instanceof Error ? err.message : err
      );
    }
  }

  // Convert imageBytes to Buffer for Gemini Vision
  let buffer: Buffer;
  if (Buffer.isBuffer(imageBytes)) {
    buffer = imageBytes;
  } else if (imageBytes instanceof File || imageBytes instanceof Blob) {
    const arrayBuffer = await imageBytes.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = Buffer.from(imageBytes);
  }

  try {
    return await extractWagonIdentitiesWithGemini(buffer, mimeType);
  } catch (geminiError: unknown) {
    // If Gemini fails and we had a remote error earlier, propagate the most helpful error
    if (geminiError instanceof OcrClientError) {
      throw geminiError;
    }
    if (remoteError instanceof OcrClientError) {
      throw remoteError;
    }
    throw new OcrClientError(
      'Fotoğraf okuma servisine ulaşılamadı. Metin Yapıştır seçeneğini kullanabilirsiniz.',
      503
    );
  }
}
