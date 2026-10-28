import 'server-only';
import { z } from 'zod';
import { OcrClientError, type OcrResponse, type OcrLine } from './ocr-client';

export const GEMINI_REQUEST_TIMEOUT_MS = 25_000;
export const DEFAULT_GEMINI_VISION_MODEL = 'gemini-3.8-flash';

export const GeminiOutputSchema = z.object({
  lines: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export type GeminiOutput = z.infer<typeof GeminiOutputSchema>;

const SYSTEM_PROMPT = `You are a fast, deterministic optical character reader (OCR) for European and Turkish freight wagons (TCDD / UIC / RIV).
Your SOLE task is reading visible wagon identity lines from wagon bodies, Saha Vaziyeti documents, or wagon lists.

INSTRUCTIONS:
1. Extract each visible wagon identity number marking as a single text line in the exact top-to-bottom order it appears in the image.
   Examples of visible lines: "31 75 2461 776-8", "3175 4568 213-8", "2461 776-8", "2461-776-8".
2. Read ONLY characters that are physically visible and clearly legible.
3. NEVER guess, invent, or complete unseen characters or check-digits.
4. NEVER calculate, estimate, or output tare weight (dara), net weight, length, axles, or technical specs.
5. NEVER fabricate wagon series or search databases.
6. If the image contains no wagons or railway documents, return an empty "lines": [] array and set an explanation in "warnings".`;

/**
 * Extracts visible wagon numbers from an image buffer using Google Gemini Vision API.
 * Ephemeral memory execution: image bytes are never saved to disk, database, or logs.
 */
export async function extractWagonIdentitiesWithGemini(
  imageBuffer: Buffer,
  mimeType: string = 'image/jpeg'
): Promise<OcrResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new OcrClientError(
      'Fotoğraf okuma servisi yapılandırılmamış (GEMINI_API_KEY eksik).',
      503
    );
  }

  const model = process.env.GEMINI_VISION_MODEL || DEFAULT_GEMINI_VISION_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  const base64Image = imageBuffer.toString('base64');
  const started = Date.now();

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.0,
      thinkingConfig: {
        thinkingLevel: 'low',
      },
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          lines: {
            type: 'ARRAY',
            items: {
              type: 'STRING',
            },
            description: 'List of visible wagon identity lines in top-to-bottom order.',
          },
          warnings: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Operational warnings for blurriness, partial occlusion, or missing items',
          },
        },
        required: ['lines'],
      },
    },
  };

  const imageSizeKb = Math.round(imageBuffer.length / 1024);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    });
  } catch (error: unknown) {
    const elapsedMs = Date.now() - started;
    const isTimeout =
      error instanceof Error &&
      (error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('aborted'));
    console.info(
      `[Wagon OCR] Boyut: ${imageSizeKb} KB, Süre: ${elapsedMs} ms, HTTP: ${isTimeout ? 504 : 503}, Timeout: ${isTimeout}`
    );
    if (isTimeout) {
      throw new OcrClientError(
        'Fotoğraf analizi zaman aşımına uğradı. Lütfen daha küçük veya net bir fotoğrafla tekrar deneyin.',
        504
      );
    }
    throw new OcrClientError(
      'Fotoğraf okuma servisine ulaşılamadı. Metin Yapıştır seçeneğini kullanabilirsiniz.',
      503
    );
  }

  const durationMs = Date.now() - started;
  console.info(
    `[Wagon OCR] Boyut: ${imageSizeKb} KB, Süre: ${durationMs} ms, HTTP: ${response.status}, Timeout: false`
  );

  if (response.status === 429) {
    throw new OcrClientError(
      'Fotoğraf okuma servisi kotası geçici olarak doldu. Lütfen bir süre sonra tekrar deneyin veya Metin Yapıştır seçeneğini kullanın.',
      429
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new OcrClientError(
      'Fotoğraf okuma servisi yetkilendirme hatası (GEMINI_API_KEY geçersiz).',
      502
    );
  }

  if (!response.ok) {
    throw new OcrClientError(
      `Fotoğraf okuma servisi şu anda kullanılamıyor (${response.status}). Lütfen tekrar deneyin.`,
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

  const parts = (rawJson as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
  })?.candidates?.[0]?.content?.parts;

  const textPart =
    parts?.find((p) => p.text && !p.thought) || parts?.find((p) => p.text) || parts?.[0];
  const jsonCandidate = textPart?.text;

  if (!jsonCandidate) {
    return {
      ok: true,
      processingTimeMs: Date.now() - started,
      processedWidth: 0,
      processedHeight: 0,
      lines: [],
      warnings: ['Görselde okunabilir vagon numarası bulunamadı.'],
    };
  }

  let cleanJsonText = jsonCandidate.trim();
  if (cleanJsonText.startsWith('```json')) {
    cleanJsonText = cleanJsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJsonText.startsWith('```')) {
    cleanJsonText = cleanJsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  let parsedData: unknown;
  try {
    parsedData = JSON.parse(cleanJsonText);
  } catch {
    throw new OcrClientError(
      'Fotoğraf analiz yanıtı JSON formatına çözümlenemedi.',
      502
    );
  }

  const validation = GeminiOutputSchema.safeParse(parsedData);
  if (!validation.success) {
    throw new OcrClientError(
      'Fotoğraf analiz yanıtı beklenen şema ile uyuşmuyor.',
      502
    );
  }

  const extractedLines = validation.data.lines;
  const lines: OcrLine[] = [];

  for (const rawLine of extractedLines) {
    const trimmed = typeof rawLine === 'string' ? rawLine.trim() : '';
    if (!trimmed) continue;

    lines.push({
      text: trimmed,
      confidence: undefined,
    });
  }

  return {
    ok: true,
    processingTimeMs: Date.now() - started,
    processedWidth: 0,
    processedHeight: 0,
    lines,
    warnings: validation.data.warnings || [],
  };
}
