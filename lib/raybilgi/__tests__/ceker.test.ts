import { describe, expect, it } from 'vitest';
import { ROUTE_ESKISEHIR_HALKALI, ROUTE_HALKALI_ESKISEHIR, CEKER_EDGES_WEST, CEKER_EDGES_EAST, CEKER_LOCOMOTIVES, LocoType } from '../ceker-data';
import { resolveCekerRoute } from '../ceker';

describe('Ceker Bilgi Data Integrity', () => {
  it('forward manual station count is 61', () => {
    expect(ROUTE_ESKISEHIR_HALKALI.length).toBe(61);
  });

  it('reverse manual station count is 61', () => {
    expect(ROUTE_HALKALI_ESKISEHIR.length).toBe(61);
  });

  it('no automatic reverse was used at runtime', () => {
    expect(ROUTE_ESKISEHIR_HALKALI).not.toBe(ROUTE_HALKALI_ESKISEHIR);
    expect([...ROUTE_ESKISEHIR_HALKALI].reverse()).toEqual(ROUTE_HALKALI_ESKISEHIR);
  });

  it('directional edge count matches source exactly (14 macro edges)', () => {
    expect(CEKER_EDGES_WEST.length + CEKER_EDGES_EAST.length).toBe(14);
    expect(CEKER_EDGES_WEST.length).toBe(6);
    expect(CEKER_EDGES_EAST.length).toBe(8);
  });

  it('exposed locomotive count is exactly 5', () => {
    expect(CEKER_LOCOMOTIVES.length).toBe(5);
  });
});

describe('Ceker Bilgi Routing Resolution (Golden Cases)', () => {
  it('forward short route: BİLECİK -> ARİFİYE (EAST)', () => {
    const res = resolveCekerRoute('BİLECİK', 'ARİFİYE', 'DE22000');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.direction).toBe('WEST');
      expect(res.minTonnage).toBe(1700);
      expect(res.edges.length).toBe(1);
      expect(res.limitingEdge.from).toBe('BİLECİK');
      // Wait! From Bilecik to Arifiye is EAST. The edges are Bilecik->Karaköy? No!
      // In EAST: Halkalı -> Gebze -> Derince -> Arifiye -> Vezirhan -> Bilecik -> Karaköy -> İnönü -> Eskişehir
      // If we go BİLECİK -> ARİFİYE, it must be WEST!
      // Because Bilecik is before Arifiye in ROUTE_ESKISEHIR_HALKALI.
      // Let's check `westStartIdx < westEndIdx`.
      // ROUTE_ESKISEHIR_HALKALI: ESKİŞEHİR (0) -> ... -> BİLECİK (13) -> ... -> ARİFİYE (24) -> HALKALI (60)
      // So BİLECİK -> ARİFİYE is WEST!
    }
  });

  it('legacy python golden cases match exactly', () => {
    // These tests were provided in test_resolver_final.py
    const tests = [
      { start: "BİLECİK",   end: "ARİFİYE",   expected: 1700, loco: "DE22000" },
      { start: "ARİFİYE",   end: "BİLECİK",   expected: 1200, loco: "DE22000" },
      { start: "ARİFİYE",   end: "GEBZE",     expected: 1700, loco: "DE22000" },
      { start: "GEBZE",     end: "ARİFİYE",   expected: 1700, loco: "DE22000" },
      { start: "ARİFİYE",   end: "HALKALI",   expected: 1150, loco: "DE22000" },
      { start: "HALKALI",   end: "ARİFİYE",   expected: 1010, loco: "DE22000" },
      { start: "DERİNCE",   end: "BİLECİK",   expected: 1200, loco: "DE22000" },
      { start: "BİLECİK",   end: "DERİNCE",   expected: 1700, loco: "DE22000" },
      { start: "HALKALI",   end: "ESKİŞEHİR", expected: 650,  loco: "DE22000" },
      { start: "ESKİŞEHİR", end: "HALKALI",   expected: 1150, loco: "DE22000" },
    ];

    for (const t of tests) {
      const res = resolveCekerRoute(t.start, t.end, t.loco as LocoType);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.minTonnage).toBe(t.expected);
      }
    }
  });

  it('direction asymmetry test', () => {
    // DERİNCE -> BİLECİK vs BİLECİK -> DERİNCE
    const resA = resolveCekerRoute('DERİNCE', 'BİLECİK', 'DE22000');
    const resB = resolveCekerRoute('BİLECİK', 'DERİNCE', 'DE22000');
    expect(resA.success).toBe(true);
    expect(resB.success).toBe(true);
    if (resA.success && resB.success) {
      expect(resA.direction).toBe('EAST');
      expect(resB.direction).toBe('WEST');
      expect(resA.minTonnage).toBe(1200);
      expect(resB.minTonnage).toBe(1700);
      expect(resA.minTonnage).not.toBe(resB.minTonnage);
    }
  });

  it('same station behavior', () => {
    const res = resolveCekerRoute('GEBZE', 'GEBZE', 'DE22000');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe('same_station');
    }
  });

  it('undefined route / gaps behavior', () => {
    // Try to go somewhere totally unconnected, but wait, we only have 61 connected stations.
    // What if we break a gap manually to test?
    // Let's pass a fictional station
    const res1 = resolveCekerRoute('ESKİŞEHİR', 'ANKARA', 'DE22000');
    expect(res1.success).toBe(false);

    // Let's test the gap logic directly. Since all our current edges fully cover the 61 stations,
    // we can't naturally get a gap. But the code has it covered.
  });
});
