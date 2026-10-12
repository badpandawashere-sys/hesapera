'use server';

import prisma from '@/lib/db/prisma';
import { getSession } from './session';
import { normalizeTurkish } from './server-auth';
import { validatePasswordPolicy, hashPassword } from './password';

export interface ChangePasswordState {
  success?: boolean;
  error?: string;
  message?: string;
}

/**
 * Server action to securely set or update the password for the currently authenticated station.
 * Identity is derived exclusively from the session (stationCode & stationName).
 * Plaintext passwords are never logged or stored.
 */
export async function changePasswordAction(
  prevState: ChangePasswordState | null,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await getSession();
  if (!session || !session.stationCode) {
    return { error: 'Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın.' };
  }

  const newPassword = (formData.get('newPassword') as string) || '';
  const confirmation = (formData.get('confirmation') as string) || '';

  const validation = validatePasswordPolicy(newPassword, confirmation);
  if (!validation.valid) {
    return { error: validation.error };
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    const canonicalUsername = normalizeTurkish(session.stationName);

    await prisma.rayBilgiStationAccount.upsert({
      where: { stationCode: session.stationCode },
      update: {
        passwordHash,
        username: canonicalUsername,
        stationName: session.stationName,
        passwordChangedAt: new Date(),
        enabled: true,
      },
      create: {
        stationCode: session.stationCode,
        username: canonicalUsername,
        stationName: session.stationName,
        passwordHash,
        passwordChangedAt: new Date(),
        enabled: true,
      },
    });

    return {
      success: true,
      message: 'Şifreniz başarıyla kaydedildi.',
    };
  } catch (error) {
    console.error('Password change error:', error);
    return { error: 'Şifre güncellenirken bir veritabanı hatası oluştu. Lütfen tekrar deneyin.' };
  }
}
