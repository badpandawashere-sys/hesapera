import 'server-only';
import { z } from 'zod';
import { OcrClientError, type OcrResponse, type OcrLine } from './ocr-client';

export const GEMINI_REQUEST_TIMEOUT_MS = 20_000;
export const DEFAULT_GEMINI_VISION_MODEL = 'gemini-3.8-flash';

export const GeminiWagonItemSchema = z.object({
  rawText: z.string().optional().default(''),
  regime: z.string().optional().default(''),
  serial: z.string().optional().default(''),
  wagonNo: z.string().optional().default(''),
  confidence: z.number().optional().default(0.95),
});

export const GeminiOutputSchema = z.object({
  wagons: z.array(GeminiWagonItemSchema).default([]),
  warnings: z.array(z.string()).default([]),
});

export type GeminiWagonItem = z.infer<typeof GeminiWagonItemSchema>;
export type GeminiOutput = z.infer<typeof GeminiOutputSchema>;

const SYSTEM_PROMPT = `You are an ultra-precise, deterministic railway optical character reader (OCR) for Turkish and European freight wagons (TCDD / UIC / RIV).
Your SOLE responsibility is extracting visible wagon identity numbers from wagon bodies, Saha Vaziyeti documents, or wagon lists.

WAGON IDENTITY MARKINGS:
- A full UIC 12-digit wagon number has three parts:
  1. Regime (4 digits, e.g. 3175, 3375, 2175, or spaced 31 75). Always strip spaces (e.g. "31 75" -> "3175").
  2. Serial code (4 digits, e.g. 2461, 4569, 5379, 2752). Always strip spaces (e.g. "24 61" -> "2461").
  3. Individual sequence number with check-digit (e.g. 776-8, 183-2, 209-6, 473-2). Keep the hyphen.
- If only the serial and wagon number are visible (e.g. "2461 776-8" or "2461-776-8"), leave regime as empty string.
- If multiple wagons are visible in a list or across the image, extract all of them in top-to-bottom order.

STRICT OPERATIONAL CONSTRAINTS (CRITICAL):
1. ZERO TARE (DARA) ESTIMATION: Absolutely DO NOT calculate, estimate, output, or guess tare weight (dara), net tonnage, or loaded weight. Even if numbers like "25.5 t" or "DARA 21.5" appear in the image, DO NOT treat them as wagon identification.
2. ZERO TECHNICAL SPECIFICATIONS: Absolutely DO NOT estimate wagon type, axle count, train length, or brake values. Technical values are strictly resolved downstream by canonical databases.
3. ZERO HALLUCINATION & NO GUESSING: Read ONLY characters that are physically visible and clearly legible. NEVER invent, predict, or guess unseen digits.
4. NO COMPLETION: If digits or check-digits are scratched, blurry, or cut off, DO NOT invent them to complete a 12-digit number. Report only what is visible or lower confidence.
5. CONFIDENCE SCORING:
   - Clear, sharp, undamaged markings: confidence 0.95 - 1.0
   - Slight glare, dust, or tilt: confidence 0.70 - 0.85
   - Blurry, partially occluded, or ambiguous: confidence < 0.65
6. NO RAILWAY DATA IN IMAGE: If the uploaded image contains no railway freight wagons, documents, or markings (e.g. personal photo, landscape, animal, blank paper), return an empty "wagons": [] array and set a descriptive message in "warnings".`;

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
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          wagons: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                rawText: {
                  type: 'STRING',
                  description:
                    'Exact text marking read from the wagon body or document, e.g. "31 75 2461 776-8" or "2461 776-8".',
                },
                regime: {
                  type: 'STRING',
                  description: '4-digit UIC regime code (e.g. 3175, 3375) or empty string',
                },
                serial: {
                  type: 'STRING',
                  description: '4-digit wagon serial number (e.g. 2461, 4569) or empty string',
                },
                wagonNo: {
                  type: 'STRING',
                  description:
                    'Wagon sequence number and check digit (e.g. 776-8, 183-2) or empty string',
                },
                confidence: {
                  type: 'NUMBER',
                  description: 'Confidence score between 0.0 and 1.0 based on visual clarity',
                },
              },
              required: ['serial', 'wagonNo'],
            },
          },
          warnings: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Operational warnings for blurriness, partial occlusion, or missing items',
          },
        },
        required: ['wagons'],
      },
    },
  };

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
    if (
      error instanceof Error &&
      (error.name === 'TimeoutError' ||
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('aborted'))
    ) {
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

  const jsonCandidate = (rawJson as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    ?.candidates?.[0]?.content?.parts?.[0]?.text;

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

  const extractedWagons = validation.data.wagons;
  const lines: OcrLine[] = [];

  for (const w of extractedWagons) {
    const raw = (w.rawText || '').trim();
    const regime = (w.regime || '').replace(/\s+/g, '').trim();
    const serial = (w.serial || '').replace(/\s+/g, '').trim();
    const wagonNo = (w.wagonNo || '').replace(/\s+/g, '').trim();

    // Line text reconstruction for deterministic downstream parseSingleDaraLine
    let lineText = raw;
    if (!lineText) {
      lineText = [regime, serial, wagonNo].filter(Boolean).join(' ');
    }

    if (lineText) {
      const conf = typeof w.confidence === 'number' ? Math.max(0, Math.min(1, w.confidence)) : 0.95;
      lines.push({
        text: lineText,
        confidence: conf,
      });
    }
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
