import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordPolicy,
} from '@/lib/raybilgi/auth/password';
import { changePasswordAction } from '@/lib/raybilgi/auth/account-actions';
import { getSession } from '@/lib/raybilgi/auth/session';
import { validateStationLogin } from '@/lib/raybilgi/auth/server-auth';
import prisma from '@/lib/db/prisma';
import ChangePasswordPage from '@/app/raybilgi/hesap/sifre/page';
import { redirect } from 'next/navigation';

vi.mock('@/lib/raybilgi/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/db/prisma', () => ({
  default: {
    rayBilgiStationAccount: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

describe('RAYBİLGİ Station Password Security (Phase A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A. password is never stored plaintext
  it('A. password is never stored plaintext in hash result', async () => {
    const plain = 'CokGuvenliSifre2026!';
    const hash = await hashPassword(plain);

    expect(hash).not.toContain(plain);
    expect(hash.startsWith('scrypt$')).toBe(true);
  });

  // B. same plaintext password generates different hashes because salt is random
  it('B. same plaintext password generates different hashes due to random salt', async () => {
    const plain = 'CokGuvenliSifre2026!';
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);

    expect(hash1).not.toBe(hash2);
    // Both should still verify successfully
    expect(await verifyPassword(plain, hash1)).toBe(true);
    expect(await verifyPassword(plain, hash2)).toBe(true);
  });

  // C. verify correct password succeeds
  it('C. verify correct password succeeds', async () => {
    const plain = 'TurkceKarakterliSifre_12345';
    const hash = await hashPassword(plain);

    const isValid = await verifyPassword(plain, hash);
    expect(isValid).toBe(true);
  });

  // D. verify incorrect password fails
  it('D. verify incorrect password fails', async () => {
    const plain = 'CokGuvenliSifre2026!';
    const hash = await hashPassword(plain);

    const isValid = await verifyPassword('YanlisSifreDenemesi123', hash);
    expect(isValid).toBe(false);
  });

  // E. password page requires session
  it('E. password page requires session and redirects unauthenticated users', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    await expect(ChangePasswordPage()).rejects.toThrow('REDIRECT:/raybilgi/giris?next=/raybilgi/hesap/sifre');
    expect(redirect).toHaveBeenCalledWith('/raybilgi/giris?next=/raybilgi/hesap/sifre');
  });

  // F & G. client cannot choose another stationCode & server action uses session stationCode
  it('F & G. server action strictly uses session stationCode and rejects client injection', async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      stationCode: '1512',
      stationName: 'ARİFİYE',
      expiresAt: new Date(),
    });

    vi.mocked(prisma.rayBilgiStationAccount.upsert).mockResolvedValueOnce({
      id: 'acc-1',
      stationCode: '1512',
      username: 'arifiye',
      stationName: 'ARİFİYE',
      passwordHash: 'scrypt$...',
      enabled: true,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const formData = new FormData();
    formData.append('newPassword', 'YeniGuvenliSifre123');
    formData.append('confirmation', 'YeniGuvenliSifre123');
    // Malicious client attempts to pass another station identity in form body
    formData.append('stationCode', '9999');
    formData.append('stationName', 'HACKED_STATION');
    formData.append('username', 'hacker');

    const result = await changePasswordAction(null, formData);

    expect(result.success).toBe(true);
    expect(prisma.rayBilgiStationAccount.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stationCode: '1512' }, // Must strictly be session stationCode
        update: expect.objectContaining({
          stationName: 'ARİFİYE',
          username: 'arifiye',
        }),
        create: expect.objectContaining({
          stationCode: '1512',
          stationName: 'ARİFİYE',
          username: 'arifiye',
        }),
      })
    );
    const callArgs = vi.mocked(prisma.rayBilgiStationAccount.upsert).mock.calls[0][0];
    expect((callArgs.update as any).stationCode).toBeUndefined();
  });

  // H. password shorter than 6 rejected, 6 accepted
  it('H. password shorter than 6 is rejected (5 chars), 6 chars accepted', async () => {
    // 5 chars -> rejected
    const policyResult5 = validatePasswordPolicy('12345', '12345');
    expect(policyResult5.valid).toBe(false);
    expect(policyResult5.error).toContain('6');

    // 6 chars -> accepted
    const policyResult6 = validatePasswordPolicy('123456', '123456');
    expect(policyResult6.valid).toBe(true);
    expect(policyResult6.error).toBeUndefined();

    vi.mocked(getSession).mockResolvedValueOnce({
      stationCode: '1512',
      stationName: 'ARİFİYE',
      expiresAt: new Date(),
    });

    const formData = new FormData();
    formData.append('newPassword', '12345');
    formData.append('confirmation', '12345');

    const actionResult = await changePasswordAction(null, formData);
    expect(actionResult.error).toContain('6');
    expect(prisma.rayBilgiStationAccount.upsert).not.toHaveBeenCalled();
  });

  // I. password mismatch rejected
  it('I. password mismatch between new password and confirmation is rejected', async () => {
    const policyResult = validatePasswordPolicy('GuvenliSifre123!', 'FarkliSifre123!');
    expect(policyResult.valid).toBe(false);
    expect(policyResult.error).toContain('eşleşmiyor');

    vi.mocked(getSession).mockResolvedValueOnce({
      stationCode: '1512',
      stationName: 'ARİFİYE',
      expiresAt: new Date(),
    });

    const formData = new FormData();
    formData.append('newPassword', 'GuvenliSifre123!');
    formData.append('confirmation', 'FarkliSifre123!');

    const actionResult = await changePasswordAction(null, formData);
    expect(actionResult.error).toContain('eşleşmiyor');
    expect(prisma.rayBilgiStationAccount.upsert).not.toHaveBeenCalled();
  });

  // J. successful save upserts account credential
  it('J. successful save upserts account credential in Prisma with hashed password', async () => {
    vi.mocked(getSession).mockResolvedValueOnce({
      stationCode: '2435',
      stationName: 'ESKİŞEHİR',
      expiresAt: new Date(),
    });

    vi.mocked(prisma.rayBilgiStationAccount.upsert).mockResolvedValueOnce({} as any);

    const formData = new FormData();
    formData.append('newPassword', 'EskisehirGuvenliSifre123');
    formData.append('confirmation', 'EskisehirGuvenliSifre123');

    const result = await changePasswordAction(null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Şifreniz başarıyla kaydedildi.');
    expect(prisma.rayBilgiStationAccount.upsert).toHaveBeenCalledTimes(1);

    const callArgs = vi.mocked(prisma.rayBilgiStationAccount.upsert).mock.calls[0][0];
    expect(callArgs.where.stationCode).toBe('2435');
    expect(callArgs.update.passwordHash).toMatch(/^scrypt\$/);
    expect(callArgs.create.passwordHash).toMatch(/^scrypt\$/);
    expect(callArgs.update.passwordChangedAt).toBeInstanceOf(Date);
  });

  // K. existing login implementation remains unchanged in Phase A
  it('K. existing login validation remains unchanged and still works via legacy derivation in Phase A', async () => {
    // 1512 is ARİFİYE, legacy password is "15121512"
    const valid = await validateStationLogin('ARİFİYE', '15121512');
    expect(valid).not.toBeNull();
    expect(valid?.stationCode).toBe('1512');
    expect(valid?.stationName).toBe('Arifiye');

    // Wrong password fails
    const invalid = await validateStationLogin('ARİFİYE', 'wrongpassword');
    expect(invalid).toBeNull();
  });
});
