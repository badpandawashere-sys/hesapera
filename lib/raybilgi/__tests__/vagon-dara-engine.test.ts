import { describe, it, expect } from 'vitest';
import {
  resolveWagonRow,
  resolveWagonsForTare,
  calculateTareTotals,
  DaraWagonInput,
} from '@/lib/raybilgi/vagon-dara-engine';
import { WagonRecord } from '@/types/raybilgi';

const mockLookup: Record<string, WagonRecord> = {
  '2461': {
    seri: '2461',
    vagon: 'Eaos',
    dingil: 4,
    dara: 21.5,
    uzunluk: 14.04,
  },
  '4569': {
    seri: '4569',
    vagon: 'Fas',
    dingil: 4,
    dara: '22,4',
    uzunluk: '12,50',
  },
  '5379': {
    seri: '5379',
    vagon: 'Ea',
    dingil: 4,
    dara: 24.4,
    uzunluk: 15.74,
  },
};

describe('vagon-dara-engine', () => {
  describe('resolveWagonRow & resolveWagonsForTare', () => {
    it('resolves valid wagon with numeric and string tare', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '2461', wagonNo: '776-8' },
        { id: '2', regime: '3175', serial: '4569', wagonNo: '183-2' },
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      expect(resolved).toHaveLength(2);
      expect(resolved[0].status).toBe('resolved');
      expect(resolved[0].wagonType).toBe('Eaos');
      expect(resolved[0].tare).toBe(21.5);
      expect(resolved[0].axle).toBe(4);
      expect(resolved[0].length).toBe(14.04);
      expect(resolved[0].isDuplicate).toBe(false);

      expect(resolved[1].status).toBe('resolved');
      expect(resolved[1].wagonType).toBe('Fas');
      expect(resolved[1].tare).toBe(22.4);
      expect(resolved[1].length).toBe(12.5);
    });

    it('marks unknown serial as unknown_serial with null tare', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '9999', wagonNo: '123-4' },
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      expect(resolved[0].status).toBe('unknown_serial');
      expect(resolved[0].tare).toBeNull();
      expect(resolved[0].wagonType).toBe('');
    });

    it('marks missing serial or wagonNo as incomplete', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '', wagonNo: '776-8' },
        { id: '2', regime: '3175', serial: '2461', wagonNo: '' },
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      expect(resolved[0].status).toBe('incomplete');
      expect(resolved[1].status).toBe('incomplete');
    });

    it('detects duplicate identical wagon identities and marks subsequent row as duplicate', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '2461', wagonNo: '776-8' },
        { id: '2', regime: '3175', serial: '5379', wagonNo: '209-6' },
        { id: '3', regime: '3175', serial: '2461', wagonNo: '776-8' }, // duplicate of #1
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      expect(resolved[0].status).toBe('resolved');
      expect(resolved[0].isDuplicate).toBe(false);

      expect(resolved[1].status).toBe('resolved');
      expect(resolved[1].isDuplicate).toBe(false);

      expect(resolved[2].status).toBe('duplicate');
      expect(resolved[2].isDuplicate).toBe(true);
    });
  });

  describe('calculateTareTotals', () => {
    it('sums tare, axles, and length ONLY for resolved non-duplicate rows', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '2461', wagonNo: '776-8' }, // 21.5 t, 4 axles, 14.04 m
        { id: '2', regime: '3175', serial: '5379', wagonNo: '209-6' }, // 24.4 t, 4 axles, 15.74 m
        { id: '3', regime: '3175', serial: '9999', wagonNo: '111-1' }, // unknown -> excluded
        { id: '4', regime: '3175', serial: '2461', wagonNo: '776-8' }, // duplicate -> excluded
        { id: '5', regime: '3175', serial: '', wagonNo: '000-0' },     // incomplete -> excluded
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);
      const totals = calculateTareTotals(resolved);

      expect(totals.totalCount).toBe(5);
      expect(totals.resolvedCount).toBe(2);
      expect(totals.controlNeededCount).toBe(3);
      expect(totals.duplicateCount).toBe(1);

      // Expected tare: 21.5 + 24.4 = 45.9
      expect(totals.totalTare).toBe(45.9);
      // Expected axles: 4 + 4 = 8
      expect(totals.totalAxles).toBe(8);
      // Expected length: 14.04 + 15.74 = 29.78
      expect(totals.totalLength).toBe(29.78);
    });

    it('returns zeroes when no rows exist', () => {
      const totals = calculateTareTotals([]);
      expect(totals.totalCount).toBe(0);
      expect(totals.resolvedCount).toBe(0);
      expect(totals.totalTare).toBe(0);
      expect(totals.totalAxles).toBe(0);
      expect(totals.totalLength).toBe(0);
      expect(totals.controlNeededCount).toBe(0);
    });
  });
});
