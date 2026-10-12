import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { validateStationLogin, normalizeTurkish } from '../server-auth';
import { hashPassword } from '../password';
import prisma from '@/lib/db/prisma';

vi.mock('@/lib/db/prisma', () => ({
  default: {
    rayBilgiStationAccount: {
      findFirst: vi.fn(),
    },
  },
}));

describe('Station Authentication (Phase B)', () => {
  let sampleHash: string;

  beforeAll(async () => {
    sampleHash = await hashPassword('GuvenliSifre2026!');
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes Turkish characters safely', () => {
    expect(normalizeTurkish('ARİFİYE')).toBe('arifiye');
    expect(normalizeTurkish('Arifiye')).toBe('arifiye');
    expect(normalizeTurkish('ESKİŞEHİR')).toBe('eskişehir');
    expect(normalizeTurkish('BÜYÜKDERBENT')).toBe('büyükderbent');
    expect(normalizeTurkish('çöğüşı')).toBe('çöğüşı');
    expect(normalizeTurkish('ÇÖĞÜŞI')).toBe('çöğüşı');
  });

  it('validates ARİFİYE successfully with correct DB password', async () => {
    vi.mocked(prisma.rayBilgiStationAccount.findFirst).mockResolvedValueOnce({
      id: 'acc-1',
      stationCode: '1512',
      stationName: 'Arifiye',
      username: 'arifiye',
      passwordHash: sampleHash,
      enabled: true,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await validateStationLogin('ARİFİYE', 'GuvenliSifre2026!');
    expect(res).not.toBeNull();
    expect(res?.stationCode).toBe('1512');
    expect(res?.stationName).toBe('Arifiye');
    expect(res?.username).toBe('arifiye');
  });

  it('validates case-insensitively with correct DB password', async () => {
    vi.mocked(prisma.rayBilgiStationAccount.findFirst).mockResolvedValueOnce({
      id: 'acc-1',
      stationCode: '1512',
      stationName: 'Arifiye',
      username: 'arifiye',
      passwordHash: sampleHash,
      enabled: true,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await validateStationLogin('aRifiYE', 'GuvenliSifre2026!');
    expect(res).not.toBeNull();
    expect(res?.stationCode).toBe('1512');
  });

  it('rejects wrong password', async () => {
    vi.mocked(prisma.rayBilgiStationAccount.findFirst).mockResolvedValueOnce({
      id: 'acc-1',
      stationCode: '1512',
      stationName: 'Arifiye',
      username: 'arifiye',
      passwordHash: sampleHash,
      enabled: true,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await validateStationLogin('ARİFİYE', 'YanlisSifre123');
    expect(res).toBeNull();
  });

  it('strictly rejects legacy station-code-derived password (no fallback)', async () => {
    vi.mocked(prisma.rayBilgiStationAccount.findFirst).mockResolvedValueOnce({
      id: 'acc-1',
      stationCode: '1512',
      stationName: 'Arifiye',
      username: 'arifiye',
      passwordHash: sampleHash,
      enabled: true,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    // Old legacy derived password was 15121512
    const res = await validateStationLogin('ARİFİYE', '15121512');
    expect(res).toBeNull();
  });

  it('rejects unknown / unprovisioned username', async () => {
    vi.mocked(prisma.rayBilgiStationAccount.findFirst).mockResolvedValueOnce(null);

    const res = await validateStationLogin('HAYALİ İSTASYON', 'GuvenliSifre2026!');
    expect(res).toBeNull();
  });

  it('rejects disabled account', async () => {
    vi.mocked(prisma.rayBilgiStationAccount.findFirst).mockResolvedValueOnce({
      id: 'acc-2',
      stationCode: '1512',
      stationName: 'Arifiye',
      username: 'arifiye',
      passwordHash: sampleHash,
      enabled: false,
      passwordChangedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const res = await validateStationLogin('ARİFİYE', 'GuvenliSifre2026!');
    expect(res).toBeNull();
  });

  it('rejects empty username or password', async () => {
    expect(await validateStationLogin('', 'GuvenliSifre2026!')).toBeNull();
    expect(await validateStationLogin('ARİFİYE', '')).toBeNull();
    expect(prisma.rayBilgiStationAccount.findFirst).not.toHaveBeenCalled();
  });
});
