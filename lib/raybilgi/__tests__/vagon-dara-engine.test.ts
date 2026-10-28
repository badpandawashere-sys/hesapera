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

    it('marks unknown serial as unknown_serial with null tare and length', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '9999', wagonNo: '123-4' },
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      expect(resolved[0].status).toBe('unknown_serial');
      expect(resolved[0].tare).toBeNull();
      expect(resolved[0].length).toBeNull();
      expect(resolved[0].wagonType).toBe('');
    });

    it('preserves dimensions for incomplete regime (175) or missing wagonNo when serial is known', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '175', serial: '2461', wagonNo: '776-8' }, // Incomplete regime (3 digits)
        { id: '2', regime: '3175', serial: '4569', wagonNo: '' },       // Missing wagonNo
        { id: '3', regime: '3175', serial: '', wagonNo: '776-8' },       // Missing serial
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      // 1. Incomplete regime with known serial
      expect(resolved[0].status).toBe('incomplete');
      expect(resolved[0].regime).toBe('175'); // Raw preserved, not force-mutated
      expect(resolved[0].length).toBe(14.04);
      expect(resolved[0].tare).toBe(21.5);
      expect(resolved[0].wagonType).toBe('Eaos');

      // 2. Missing wagonNo with known serial
      expect(resolved[1].status).toBe('incomplete');
      expect(resolved[1].length).toBe(12.5);
      expect(resolved[1].tare).toBe(22.4);
      expect(resolved[1].wagonType).toBe('Fas');

      // 3. Missing serial (cannot know dimensions)
      expect(resolved[2].status).toBe('incomplete');
      expect(resolved[2].length).toBeNull();
      expect(resolved[2].tare).toBeNull();
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

    it('does NOT mark two rows as duplicates if sequence number is missing', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '2461', wagonNo: '' },
        { id: '2', regime: '3175', serial: '2461', wagonNo: '' }, // same serial, no sequence no -> not duplicate
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);
      expect(resolved[0].isDuplicate).toBe(false);
      expect(resolved[1].isDuplicate).toBe(false);

      const totals = calculateTareTotals(resolved);
      expect(totals.resolvedCount).toBe(2);
      expect(totals.totalLength).toBe(28.08); // 14.04 * 2
    });

    it('does NOT silently merge different or incomplete regimes into duplicates, but flags review alert', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '2461', wagonNo: '776-8' }, // Complete regime
        { id: '2', regime: '2175', serial: '2461', wagonNo: '776-8' }, // Different complete regime
        { id: '3', regime: '175',  serial: '2461', wagonNo: '776-8' }, // Incomplete regime
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);

      // Row 1: Valid initial entry
      expect(resolved[0].isDuplicate).toBe(false);
      expect(resolved[0].status).toBe('resolved');

      // Row 2: Different regime (2175 vs 3175) -> NOT duplicate, but alerted
      expect(resolved[1].isDuplicate).toBe(false);
      expect(resolved[1].status).toBe('resolved');
      expect(resolved[1].statusMessage).toContain('Benzer seri ve vagon no');

      // Row 3: Incomplete regime (175) -> NOT duplicate, both counted, alerted
      expect(resolved[2].isDuplicate).toBe(false);
      expect(resolved[2].status).toBe('incomplete');
      expect(resolved[2].statusMessage).toContain('Benzer seri ve vagon no');

      // All 3 rows are included in length & tare because there is no definite proof of duplication!
      const totals = calculateTareTotals(resolved);
      expect(totals.resolvedCount).toBe(3);
      expect(totals.totalLength).toBe(42.12); // 14.04 * 3
    });

    it('marks identical incomplete regime rows as definite duplicate', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '175', serial: '2461', wagonNo: '776-8' },
        { id: '2', regime: '175', serial: '2461', wagonNo: '776-8' }, // exact same incomplete row
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);
      expect(resolved[0].isDuplicate).toBe(false);
      expect(resolved[1].isDuplicate).toBe(true);
      expect(resolved[1].status).toBe('duplicate');

      const totals = calculateTareTotals(resolved);
      expect(totals.resolvedCount).toBe(1);
      expect(totals.duplicateCount).toBe(1);
    });
  });

  describe('calculateTareTotals', () => {
    it('sums tare, axles, and length for recognized non-duplicate rows including incomplete regime/no', () => {
      const inputs: DaraWagonInput[] = [
        { id: '1', regime: '3175', serial: '2461', wagonNo: '776-8' }, // 21.5 t, 4 axles, 14.04 m (resolved)
        { id: '2', regime: '175',  serial: '5379', wagonNo: '209-6' }, // 24.4 t, 4 axles, 15.74 m (incomplete regime -> INCLUDED!)
        { id: '3', regime: '3175', serial: '9999', wagonNo: '111-1' }, // unknown serial -> excluded
        { id: '4', regime: '3175', serial: '2461', wagonNo: '776-8' }, // duplicate -> excluded
        { id: '5', regime: '3175', serial: '', wagonNo: '000-0' },     // missing serial -> excluded
      ];

      const resolved = resolveWagonsForTare(inputs, mockLookup);
      const totals = calculateTareTotals(resolved);

      expect(totals.totalCount).toBe(5);
      expect(totals.resolvedCount).toBe(2); // rows 1 and 2 included!
      expect(totals.controlNeededCount).toBe(4); // row 2 (incomplete regime), 3 (unknown), 4 (dup), 5 (missing serial)
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
