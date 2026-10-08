import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretStr = process.env.RAYBILGI_SESSION_SECRET;
const secretKey = secretStr || 'fallback_secret_only_for_local_dev_1234567890';
const encodedKey = new TextEncoder().encode(secretKey);

function ensureProductionSecret() {
  if (!secretStr && process.env.NODE_ENV === 'production') {
    throw new Error('RAYBILGI_SESSION_SECRET environment variable is missing.');
  }
}

export type SessionPayload = {
  stationCode: string;
  stationName: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  ensureProductionSecret();
  return new SignJWT({ ...payload, expiresAt: payload.expiresAt.toISOString() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(payload.expiresAt)
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  ensureProductionSecret();
  try {
    if (!session) return null;
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return {
      ...payload,
      expiresAt: new Date(payload.expiresAt as string),
    } as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(stationCode: string, stationName: string, rememberMe: boolean) {
  const expiresInMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000; // 30 days or 2 hours
  const expiresAt = new Date(Date.now() + expiresInMs);
  const session = await encrypt({ stationCode, stationName, expiresAt });

  const cookieStore = await cookies();
  cookieStore.set('raybilgi_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/raybilgi',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get('raybilgi_session')?.value;
  return await decrypt(sessionValue);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('raybilgi_session');
}
