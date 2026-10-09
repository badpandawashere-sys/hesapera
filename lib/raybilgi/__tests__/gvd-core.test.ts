import { describe, it, expect } from 'vitest';
import { GvdStatus } from '@/types/raybilgi';
import { GvdRepository } from '@/lib/raybilgi/gvd-repository';

describe('GVD Core Module', () => {
  it('should have exact status order', () => {
    const STATUS_ORDER: GvdStatus[] = [
      'Dolu Yük',
      'Boş Yük',
      'Dolmakta',
      'Boşalmakta',
      'Yedek',
      'Tamirlik',
      'Iskat',
      'Tescilsiz'
    ];
    expect(STATUS_ORDER[0]).toBe('Dolu Yük');
    expect(STATUS_ORDER[1]).toBe('Boş Yük');
    expect(STATUS_ORDER[7]).toBe('Tescilsiz');
  });

  it('should return empty records from repository when no DB is connected', async () => {
    const active = await GvdRepository.getActiveRecords('arifiye');
    expect(active).toEqual([]);

    const history = await GvdRepository.getHistoryRecords('arifiye');
    expect(history).toEqual([]);
  });

  it('should throw Error when attempting to mutate GVD records since DB is required', async () => {
    await expect(GvdRepository.createRecord('arifiye', {} as any)).rejects.toThrow(/GVD_DB_REQUIRED/);
    await expect(GvdRepository.updateRecord('arifiye', '1', {})).rejects.toThrow(/GVD_DB_REQUIRED/);
    await expect(GvdRepository.moveToHistory('arifiye', ['1'])).rejects.toThrow(/GVD_DB_REQUIRED/);
  });
});
