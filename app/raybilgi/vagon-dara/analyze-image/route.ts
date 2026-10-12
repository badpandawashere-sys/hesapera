import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/raybilgi/auth/session';
import { extractWagonIdentitiesFromImage } from '@/lib/raybilgi/gemini-vision';

export const dynamic = 'force-dynamic';

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
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // 6. Extract wagon identities via Gemini Vision
    const wagons = await extractWagonIdentitiesFromImage(base64, file.type);

    return NextResponse.json({
      ok: true,
      wagons,
      count: wagons.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Görsel işlenirken bir hata oluştu.';

    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ ok: false, error: message }, { status: 429 });
    }

    if (message.includes('GEMINI_API_KEY')) {
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
