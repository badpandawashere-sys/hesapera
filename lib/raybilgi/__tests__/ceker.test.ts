import { describe, expect, it } from 'vitest';
import { ROUTE_ESKISEHIR_HALKALI, ROUTE_HALKALI_ESKISEHIR, CEKER_EDGES_WEST, CEKER_EDGES_EAST, CEKER_LOCOMOTIVES, LocoType } from '../ceker-data';
import { resolveCekerRoute } from '../ceker';

describe('Ceker Bilgi Data Integrity', () => {
  it('has 61 stations exactly', () => {
    expect(ROUTE_ESKISEHIR_HALKALI.length).toBe(61);
    expect(ROUTE_HALKALI_ESKISEHIR.length).toBe(61);
  });

  it('no auto reverse in arrays', () => {
    // Note: in testing it's fine to use reverse to assert parity
    // but the source literal itself does not use reverse.
    expect([...ROUTE_ESKISEHIR_HALKALI].reverse()).toEqual(ROUTE_HALKALI_ESKISEHIR);
  });

  it('has 14 directional macro edges', () => {
    expect(CEKER_EDGES_WEST.length + CEKER_EDGES_EAST.length).toBe(14);
  });
  
  it('has 14 locos', () => {
    expect(CEKER_LOCOMOTIVES.length).toBe(14);
  });
});

describe('Ceker Bilgi Core Logic', () => {
  it('same station returns error', () => {
    const res = resolveCekerRoute('ESKİŞEHİR', 'ESKİŞEHİR');
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error).toBe('same_station');
    }
  });

  it('undefined route / gaps behavior', () => {
    const res1 = resolveCekerRoute('ESKİŞEHİR', 'ANKARA');
    expect(res1.success).toBe(false);
  });

  it('direction detection', () => {
    const fw = resolveCekerRoute('ESKİŞEHİR', 'HALKALI');
    expect(fw.success).toBe(true);
    if (fw.success) expect(fw.direction).toBe('WEST');

    const rev = resolveCekerRoute('HALKALI', 'ESKİŞEHİR');
    expect(rev.success).toBe(true);
    if (rev.success) expect(rev.direction).toBe('EAST');
  });
});

describe('Python Golden Cases', () => {
  const getLocoVal = (res: any, loco: string) => {
    return res.locomotives.find((l: any) => l.locomotive === loco)?.maxTonnage;
  };

  it('BİLECİK -> ARİFİYE (DE22000 = 1700)', () => {
    const res = resolveCekerRoute('BİLECİK', 'ARİFİYE');
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(getLocoVal(res, 'de22000')).toBe(1700);
    const ties = res.locomotives.find(l => l.locomotive === 'de22000')?.limitingSections.map(e => e.from + '->' + e.to);
    expect(ties).toEqual(['BİLECİK->DERİNCE']);
  });

  it('ARİFİYE -> BİLECİK (DE22000 = 1200)', () => {
    const res = resolveCekerRoute('ARİFİYE', 'BİLECİK');
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(getLocoVal(res, 'de22000')).toBe(1200);
  });

  it('ARİFİYE -> HALKALI (DE22000 = 1150)', () => {
    const res = resolveCekerRoute('ARİFİYE', 'HALKALI');
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(getLocoVal(res, 'de22000')).toBe(1150);
  });

  it('HALKALI -> ESKİŞEHİR (DE22000 = 650)', () => {
    const res = resolveCekerRoute('HALKALI', 'ESKİŞEHİR');
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(getLocoVal(res, 'de22000')).toBe(650);
  });

  it('ESKİŞEHİR -> HALKALI (DE22000 = 1150)', () => {
    const res = resolveCekerRoute('ESKİŞEHİR', 'HALKALI');
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(getLocoVal(res, 'de22000')).toBe(1150);
    const ties = res.locomotives.find(l => l.locomotive === 'de22000')?.limitingSections.map(e => e.from + '->' + e.to);
    expect(ties).toEqual(['GEBZE->HALKALI']);
  });

  it('All 14 columns present for Bilecik -> Derince', () => {
    const res = resolveCekerRoute('BİLECİK', 'DERİNCE');
    expect(res.success).toBe(true);
    if (!res.success) return;
    
    expect(getLocoVal(res, 'de22000')).toBe(1700);
    expect(getLocoVal(res, 'de24000')).toBe(1355);
    expect(getLocoVal(res, 'de33000')).toBe(2340);
    expect(getLocoVal(res, 'de36000')).toBe(2500);
    expect(getLocoVal(res, 'e43000')).toBe(2500);
    expect(getLocoVal(res, 'e68000')).toBe(2250);
    expect(getLocoVal(res, 'e68000_m')).toBe(2500);
    expect(getLocoVal(res, 'hb83000_dizel')).toBe(2500);
    expect(getLocoVal(res, 'hb83000_elektrik')).toBe(2500);
    expect(getLocoVal(res, 'e76000')).toBe(2500);
    expect(getLocoVal(res, 'e5000')).toBe(2500);
    expect(getLocoVal(res, 'ton_100')).toBe(1970);
    expect(getLocoVal(res, 'ton_150')).toBe(3000);
    expect(getLocoVal(res, 'ton_350')).toBe(4000);
    
    expect(res.locomotives.length).toBe(14);
  });
  
  it('Tie preservation test', () => {
      const res = resolveCekerRoute('BİLECİK', 'GEBZE');
      expect(res.success).toBe(true);
      if (!res.success) return;
      const ties = res.locomotives.find(l => l.locomotive === 'de22000')?.limitingSections;
      expect(ties?.length).toBe(2);
      expect(ties?.[0].from).toBe('BİLECİK');
      expect(ties?.[0].to).toBe('DERİNCE');
      expect(ties?.[1].from).toBe('DERİNCE');
      expect(ties?.[1].to).toBe('GEBZE');
  });
});
