import { NextResponse } from 'next/server';
import { getSession } from '@/lib/raybilgi/auth/session';
import { generate5600Xlsx } from '@/lib/raybilgi/mod5600-export';
import { z } from 'zod';

export const runtime = 'nodejs';

const RowSchema = z.object({
  regime: z.string().max(50).optional().default(''),
  serial: z.string().max(50).optional().default(''),
  wagonNo: z.string().max(50).optional().default(''),
  departure: z.string().max(100).optional().default(''),
  arrival: z.string().max(100).optional().default(''),
  netInput: z.string().max(50).optional().default(''),
});

const Export5600RequestSchema = z.object({
  trainNo: z.string().max(50).optional().default(''),
  departure: z.string().max(100).optional().default(''),
  arrival: z.string().max(100).optional().default(''),
  rows: z.array(RowSchema).max(49, 'En fazla 49 vagon eklenebilir.').optional().default([]),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !session.stationCode) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Geçersiz istek gövdesi.' },
      { status: 400 }
    );
  }

  const parseResult = Export5600RequestSchema.safeParse(body);
  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0]?.message || 'Geçersiz veri gönderildi.';
    return NextResponse.json({ error: firstIssue }, { status: 400 });
  }

  try {
    const { buffer, filename } = await generate5600Xlsx(parseResult.data);

    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : 'XLSX çıktısı oluşturulamadı.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
