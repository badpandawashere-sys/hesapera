import 'server-only';
import { z } from 'zod';

export const OcrBBoxSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
});

export const OcrLineSchema = z.object({
  text: z.string(),
  confidence: z.number(),
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
 * Sends image to the fast self-hosted RapidOCR service on Railway or local host.
 * Strictly 0 retries, 12s timeout, Zod validation.
 */
export async function recognizeWagonList(
  imageBytes: Uint8Array | Buffer | Blob | File,
  mimeType: string = 'image/jpeg'
): Promise<OcrResponse> {
  const apiUrl = process.env.WAGON_OCR_API_URL || 'http://127.0.0.1:8000';
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
