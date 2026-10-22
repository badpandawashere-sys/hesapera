import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/raybilgi/auth/session';
import {
  recognizeWagonList,
  OcrClientError,
  type ExtractedWagonIdentity,
} from '@/lib/raybilgi/ocr-client';
import { parseSingleDaraLine, isHeaderLine } from '@/lib/raybilgi/vagon-dara-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate RayBilgi session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { ok: false, error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    // 2. Parse multipart form data
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { ok: false, error: 'Geçersiz istek formu.' },
        { status: 400 }
      );
    }

    const file = formData.get('image');
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'Görsel dosyası bulunamadı.' },
        { status: 400 }
      );
    }

    // 3. Validate file size (max 8MB)
    if (file.size === 0) {
      return NextResponse.json({ ok: false, error: 'Görsel dosyası boş.' }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, error: 'Dosya boyutu 8 MB sınırını aşıyor.' },
        { status: 400 }
      );
    }

    // 4. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Desteklenmeyen dosya formatı. Yalnızca JPEG, PNG veya WebP kabul edilir.',
        },
        { status: 400 }
      );
    }

    // 5. Read file into memory buffer (ephemeral, not written to disk or database)
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const signature = Buffer.from(bytes.subarray(0, 12));
    const validImage =
      file.type === 'image/jpeg'
        ? signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff
        : file.type === 'image/png'
        ? signature.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : signature.toString('ascii', 0, 4) === 'RIFF' &&
          signature.toString('ascii', 8, 12) === 'WEBP';

    if (!validImage) {
      return NextResponse.json(
        { ok: false, error: 'Görsel içeriği dosya türüyle uyuşmuyor veya dosya bozuk.' },
        { status: 400 }
      );
    }

    // 6. Call fast self-hosted OCR service
    const ocrResult = await recognizeWagonList(bytes, file.type);

    if (!ocrResult.lines || ocrResult.lines.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Fotoğrafta okunabilir vagon numarası bulunamadı.' },
        { status: 400 }
      );
    }

    // 7. Parse OCR lines with existing deterministic wagon parser
    const wagons: ExtractedWagonIdentity[] = [];

    for (const line of ocrResult.lines) {
      const trimmed = line.text.trim();
      if (!trimmed || isHeaderLine(trimmed)) continue;

      const parsed = parseSingleDaraLine(trimmed);
      if (!parsed) continue;

      // Confidence metadata
      let confidenceWarning: string | undefined;
      if (line.confidence < 0.65) {
        confidenceWarning = 'Numarayı doğrulayın';
      } else if (line.confidence < 0.85) {
        confidenceWarning = 'Okumayı kontrol edin';
      }

      if (parsed.serial || parsed.wagonNo) {
        wagons.push({
          rawText: trimmed,
          regime: parsed.regime || '',
          serial: parsed.serial || '',
          wagonNo: parsed.wagonNo || '',
          confidence: line.confidence,
          confidenceWarning,
        });
      }
    }

    if (wagons.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Fotoğrafta okunabilir vagon numarası bulunamadı.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      wagons,
      count: wagons.length,
      warnings: ocrResult.warnings,
    });
  } catch (error: unknown) {
    if (error instanceof OcrClientError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { ok: false, error: 'Görsel işlenirken bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
