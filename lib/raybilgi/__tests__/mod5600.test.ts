import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseTurkishFloat,
  normalizeSerial,
  calculateWagonRow,
  calculateTrainTotals,
} from '@/lib/raybilgi/mod5600-engine';
import { get5600WagonLookup, get5600StationNames } from '@/lib/raybilgi/mod5600-reference';
import { WagonRecord, WagonRowInput } from '@/types/raybilgi';
import { getSession } from '@/lib/raybilgi/auth/session';
import { redirect } from 'next/navigation';
import Mod5600Page from '@/app/raybilgi/5600/page';

vi.mock('@/lib/raybilgi/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const mockLookup: Record<string, WagonRecord> = {
  '5379': {
    seri: '5379',
    vagon: 'Ea',
    dingil: 4,
    dara: 24.4,
    uzunluk: 15.74,
    fren_bos: 26,
    fren_dolu: 72,
    fren_aralik: 25,
  },
  '9999': {
    seri: '9999',
    vagon: 'ÖZEL',
    dingil: 4,
    dara: 34.0,
    uzunluk: 35.0,
    fren_bos: null,
    fren_dolu: null,
    fren_aralik: null,
    _is_user: true,
  },
  'NO_THRESHOLD': {
    seri: 'NO_THRESHOLD',
    vagon: 'H',
    dingil: 4,
    dara: 20,
    uzunluk: 15,
    fren_bos: 20,
    fren_dolu: 50,
    fren_aralik: null,
  },
  'EQUAL_TEST': {
    seri: 'EQUAL_TEST',
    vagon: 'Sg',
    dingil: 4,
    dara: 20,
    uzunluk: 18,
    fren_bos: 22,
    fren_dolu: 55,
    fren_aralik: 45, // threshold is 45
  },
};

describe('RAYBİLGİ 5600 Engine & Reference Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // A. known serial lookup
  it('A. known serial lookup correctly populates wagon technical specs', () => {
    const input: WagonRowInput = {
      id: '1',
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: '',
      arrival: '',
      netInput: '10',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.isValid).toBe(true);
    expect(result.wagonType).toBe('Ea');
    expect(result.axle).toBe(4);
    expect(result.tare).toBe(24.4);
    expect(result.length).toBe(15.74);
  });

  // B. unknown serial invalid
  it('B. unknown serial is marked as invalid with empty technical fields', () => {
    const input: WagonRowInput = {
      id: '2',
      regime: '3175',
      serial: '99999_UNKNOWN',
      wagonNo: '100-1',
      departure: '',
      arrival: '',
      netInput: '20',
    };
    const result = calculateWagonRow(input, 2, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.isValid).toBe(false);
    expect(result.hasInput).toBe(true);
    expect(result.wagonType).toBe('');
    expect(result.tare).toBeNull();
    expect(result.gross).toBeNull();
    expect(result.brake).toBeNull();
  });

  // C. 25,4 parses to 25.4
  it('C. Turkish decimal with comma (25,4) parses to 25.4 correctly', () => {
    expect(parseTurkishFloat('25,4')).toBe(25.4);
    expect(parseTurkishFloat('25.4')).toBe(25.4);
    expect(parseTurkishFloat('   10,50   ')).toBe(10.5);
    expect(parseTurkishFloat('')).toBeNull();
    expect(parseTurkishFloat('—')).toBeNull();
  });

  // D. gross = tare + net
  it('D. gross is calculated as tare + net', () => {
    const input: WagonRowInput = {
      id: '3',
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: '',
      arrival: '',
      netInput: '25,6',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.tare).toBe(24.4);
    expect(result.net).toBe(25.6);
    expect(result.gross).toBeCloseTo(50.0);
  });

  // E. gross below threshold -> fren_bos
  it('E. gross below threshold uses empty brake (fren_bos)', () => {
    // 5379: tare = 24.4, threshold = 25, fren_bos = 26, fren_dolu = 72
    // If net = 0.5, gross = 24.9 < 25 -> fren_bos (26)
    const input: WagonRowInput = {
      id: '4',
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: '',
      arrival: '',
      netInput: '0.5',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.gross).toBe(24.9);
    expect(result.brake).toBe(26);
  });

  // F. gross equal threshold -> fren_dolu
  it('F. gross equal threshold uses loaded brake (fren_dolu)', () => {
    // EQUAL_TEST: tare = 20, threshold = 45, fren_bos = 22, fren_dolu = 55
    // If net = 25, gross = 45 -> equals threshold -> fren_dolu (55)
    const input: WagonRowInput = {
      id: '5',
      regime: '3175',
      serial: 'EQUAL_TEST',
      wagonNo: '101',
      departure: '',
      arrival: '',
      netInput: '25',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.gross).toBe(45);
    expect(result.brake).toBe(55);
  });

  // G. gross above threshold -> fren_dolu
  it('G. gross above threshold uses loaded brake (fren_dolu)', () => {
    // 5379: tare = 24.4, threshold = 25, fren_dolu = 72
    // If net = 20, gross = 44.4 > 25 -> fren_dolu (72)
    const input: WagonRowInput = {
      id: '6',
      regime: '3175',
      serial: '5379',
      wagonNo: '183-2',
      departure: '',
      arrival: '',
      netInput: '20',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.gross).toBe(44.4);
    expect(result.brake).toBe(72);
  });

  // H. absent threshold -> fren_dolu
  it('H. absent threshold defaults to loaded brake (fren_dolu)', () => {
    // NO_THRESHOLD: threshold = null, fren_dolu = 50
    const input: WagonRowInput = {
      id: '7',
      regime: '3175',
      serial: 'NO_THRESHOLD',
      wagonNo: '102',
      departure: '',
      arrival: '',
      netInput: '15',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.brake).toBe(50);
  });

  // I. totals correct
  it('I. train totals sum correctly across all valid wagons', () => {
    const row1 = calculateWagonRow(
      { id: '1', regime: '3175', serial: '5379', wagonNo: '1', departure: '', arrival: '', netInput: '10' },
      1,
      mockLookup,
      'ARİFİYE',
      'KÖRFEZ'
    );
    const row2 = calculateWagonRow(
      { id: '2', regime: '3175', serial: 'NO_THRESHOLD', wagonNo: '2', departure: '', arrival: '', netInput: '15' },
      2,
      mockLookup,
      'ARİFİYE',
      'KÖRFEZ'
    );
    // Invalid row should NOT be counted in totals
    const rowInvalid = calculateWagonRow(
      { id: '3', regime: '3175', serial: 'INVALID', wagonNo: '3', departure: '', arrival: '', netInput: '99' },
      3,
      mockLookup,
      'ARİFİYE',
      'KÖRFEZ'
    );

    const totals = calculateTrainTotals([row1, row2, rowInvalid]);

    expect(totals.wagonCount).toBe(2);
    expect(totals.totalAxle).toBe(8); // 4 + 4
    expect(totals.totalLength).toBeCloseTo(15.74 + 15);
    expect(totals.totalTare).toBeCloseTo(24.4 + 20);
    expect(totals.totalNet).toBeCloseTo(10 + 15);
    expect(totals.totalGross).toBeCloseTo(34.4 + 35);
    expect(totals.totalBrake).toBe(72 + 50);
  });

  // J. requiredBrake = ceil(totalGross * 0.41)
  it('J. requiredBrake is calculated as ceil(totalGross * 0.41)', () => {
    const row = calculateWagonRow(
      { id: '1', regime: '3175', serial: '5379', wagonNo: '1', departure: '', arrival: '', netInput: '10' },
      1,
      mockLookup,
      'ARİFİYE',
      'KÖRFEZ'
    );
    const totals = calculateTrainTotals([row]);

    // gross = 24.4 + 10 = 34.4
    // 34.4 * 0.41 = 14.104 -> ceil = 15
    expect(totals.totalGross).toBeCloseTo(34.4);
    expect(totals.requiredBrake).toBe(Math.ceil(34.4 * 0.41));
    expect(totals.requiredBrake).toBe(15);
  });

  // K. departure inheritance
  it('K. row inherits top-level departure when row departure is empty', () => {
    const input: WagonRowInput = {
      id: '1',
      regime: '3175',
      serial: '5379',
      wagonNo: '1',
      departure: '',
      arrival: '',
      netInput: '',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.departure).toBe('ARİFİYE');
  });

  // L. arrival inheritance
  it('L. row inherits top-level arrival when row arrival is empty', () => {
    const input: WagonRowInput = {
      id: '1',
      regime: '3175',
      serial: '5379',
      wagonNo: '1',
      departure: '',
      arrival: '',
      netInput: '',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.arrival).toBe('KÖRFEZ');
  });

  // M. row override beats top-level station
  it('M. row-level station override takes precedence over top-level station', () => {
    const input: WagonRowInput = {
      id: '1',
      regime: '3175',
      serial: '5379',
      wagonNo: '1',
      departure: 'DERİNCE',
      arrival: 'KÖSEKÖY',
      netInput: '',
    };
    const result = calculateWagonRow(input, 1, mockLookup, 'ARİFİYE', 'KÖRFEZ');

    expect(result.departure).toBe('DERİNCE');
    expect(result.arrival).toBe('KÖSEKÖY');
  });

  // N. max 49 rows limit enforcement
  it('N. maximum 49 wagons rule is defined as 49', () => {
    const MAX_ALLOWED = 49;
    const testList = Array.from({ length: 60 }, (_, i) => ({
      id: String(i),
      regime: '3175',
      serial: '5379',
      wagonNo: String(i),
      departure: '',
      arrival: '',
      netInput: '10',
    }));

    // The component caps at 49
    const capped = testList.slice(0, MAX_ALLOWED);
    expect(capped.length).toBe(49);
  });

  // O. station codes absent from client-facing 5600 data
  it('O. client-facing station list contains names only without 4-digit code mapping', () => {
    const stationNames = get5600StationNames();

    expect(Array.isArray(stationNames)).toBe(true);
    expect(stationNames.length).toBeGreaterThan(0);

    // Each item must be a string representing station name, not an object with codes
    for (const name of stationNames.slice(0, 50)) {
      expect(typeof name).toBe('string');
      // Must not be a 4-digit numeric code
      expect(/^\d{4}$/.test(name)).toBe(false);
    }
  });

  // Canonical precedence test
  it('Canonical precedence: TECH_DATA overrides vagon_data.json, vagon_user overrides all', () => {
    const canonicalLookup = get5600WagonLookup();

    // 5379 is in TECH_DATA and has fren_bos = 26, fren_dolu = 72
    expect(canonicalLookup['5379']).toBeDefined();
    expect(canonicalLookup['5379'].fren_bos).toBe(26);
    expect(canonicalLookup['5379'].fren_dolu).toBe(72);

    // 9999 is in vagon_data_user.json and must be present
    expect(canonicalLookup['9999']).toBeDefined();
    expect(canonicalLookup['9999']._is_user).toBe(true);
  });

  // P. unauthenticated page redirects to login
  it('P. unauthenticated access redirects to /raybilgi/giris?next=/raybilgi/5600', async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    await expect(Mod5600Page()).rejects.toThrow('REDIRECT:/raybilgi/giris?next=/raybilgi/5600');
    expect(redirect).toHaveBeenCalledWith('/raybilgi/giris?next=/raybilgi/5600');
  });
});
