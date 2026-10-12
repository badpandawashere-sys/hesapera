import 'server-only';
import { z } from 'zod';

export interface ExtractedWagonIdentity {
  rawText: string;
  regime: string;
  serial: string;
  wagonNo: string;
}

const WagonIdentityItemSchema = z.object({
  rawText: z.string().optional().default(''),
  regime: z.string().optional().default(''),
  serial: z.string().optional().default(''),
  wagonNo: z.string().optional().default(''),
});

const VisionOutputSchema = z.object({
  wagons: z.array(WagonIdentityItemSchema).default([]),
});

/**
 * Extracts wagon identity numbers from an image buffer using Gemini Vision.
 *
 * CRITICAL ARCHITECTURAL CONSTRAINTS:
 * 1. AI/Vision may ONLY read wagon identity numbers (regime, serial, wagonNo).
 * 2. AI MUST NEVER decide or estimate tare, wagon type, axle count, length, brake, or weight.
 * 3. Ephemeral memory only - no image files saved to disk, DB, or logs.
 */
export async function extractWagonIdentitiesFromImage(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<ExtractedWagonIdentity[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY yapılandırılmamış. Lütfen sunucu ortam değişkenlerini kontrol edin.');
  }

  const model = process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemPrompt = `You are a specialized railway operational OCR assistant for European/Turkish freight wagons (UIC / RIV).
Your ONLY task is to extract wagon identification markings visible on wagon bodies, Saha Vaziyeti documents, or handwritten/typed lists in the image.

Wagon Identity Rules:
- Full UIC 12-digit number has three parts:
  1. Regime (4 digits, e.g. 3175, 3375, 2175, or with space 31 75)
  2. Serial code (4 digits, e.g. 2461, 4569, 5379, 2752)
  3. Individual wagon sequence number with check-digit (e.g. 776-8, 183-2, 209-6, 473-2, 262-5)
- If only serial and wagon number are visible (e.g. "2461 776-8" or "2461-776-8"), leave regime as empty string.
- If multiple wagons are visible, extract all of them in top-to-bottom or left-to-right order.

STRICT CONSTRAINTS:
- DO NOT calculate, estimate, or output wagon tare weight (dara), net tonnage, wagon type, axles, or technical values.
- Strip spaces from regime (e.g. "31 75" -> "3175").
- Strip spaces from serial (e.g. "24 61" -> "2461").
- Ensure wagonNo keeps its hyphenated check digit if present (e.g. "776-8").`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemPrompt },
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
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          wagons: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                rawText: { type: 'STRING', description: 'Original text line read from image' },
                regime: { type: 'STRING', description: '4-digit regime (e.g. 3175)' },
                serial: { type: 'STRING', description: '4-digit wagon serial (e.g. 2461)' },
                wagonNo: { type: 'STRING', description: 'Sequence number with check digit (e.g. 776-8)' },
              },
              required: ['serial', 'wagonNo'],
            },
          },
        },
        required: ['wagons'],
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(30000),
  });

  if (response.status === 429) {
    throw new Error('Gemini API kotası aşıldı (429 RESOURCE_EXHAUSTED). Lütfen bir süre sonra tekrar deneyin.');
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini API isteği başarısız oldu (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const json = await response.json();
  const candidateText =
    json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  // Strip possible markdown wrapping
  let cleanJson = candidateText.trim();
  if (cleanJson.startsWith('```json')) {
    cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanJson.startsWith('```')) {
    cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanJson);
  const validated = VisionOutputSchema.parse(parsed);

  return validated.wagons.map((w) => ({
    rawText: w.rawText?.trim() || '',
    regime: w.regime?.replace(/\s+/g, '').trim() || '',
    serial: w.serial?.replace(/\s+/g, '').trim() || '',
    wagonNo: w.wagonNo?.replace(/\s+/g, '').trim() || '',
  }));
}
