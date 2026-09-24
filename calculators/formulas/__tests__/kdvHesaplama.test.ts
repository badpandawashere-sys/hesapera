import { describe, it, expect } from 'vitest';
import { calculateKdv } from '../kdvHesaplama';

describe('calculateKdv Formula', () => {
  it('KDV Ekle modunda 1000 TL %20 iin doYru hesaplar', () => {
    const res = calculateKdv(1000, 20, 'ekle');
    expect(res.primaryResult).toBe(1200);
    expect(res.secondaryResults['KDV Hariç Tutar']).toBe(1000);
    expect(res.secondaryResults['KDV Tutarı']).toBe(200);
    expect(res.secondaryResults['KDV Dahil Tutar']).toBe(1200);
  });

  it('KDV Ekle modunda 1000 TL %10 iin doYru hesaplar', () => {
    const res = calculateKdv(1000, 10, 'ekle');
    expect(res.primaryResult).toBe(1100);
    expect(res.secondaryResults['KDV Hariç Tutar']).toBe(1000);
    expect(res.secondaryResults['KDV Tutarı']).toBe(100);
  });

  it('KDV Ekle modunda 1000 TL %1 iin doYru hesaplar', () => {
    const res = calculateKdv(1000, 1, 'ekle');
    expect(res.primaryResult).toBe(1010);
    expect(res.secondaryResults['KDV Tutarı']).toBe(10);
  });

  it('KDV Cikar modunda 1200 TL %20 iin doYru hesaplar', () => {
    const res = calculateKdv(1200, 20, 'cikar');
    expect(res.primaryResult).toBe(1000); // KDV Haric Tutar is primary
    expect(res.secondaryResults['KDV Hariç Tutar']).toBe(1000);
    expect(res.secondaryResults['KDV Tutarı']).toBe(200);
    expect(res.secondaryResults['KDV Dahil Tutar']).toBe(1200);
  });

  it('KDV Cikar modunda 1100 TL %10 iin doYru hesaplar', () => {
    const res = calculateKdv(1100, 10, 'cikar');
    expect(res.primaryResult).toBe(1000);
    expect(res.secondaryResults['KDV Tutarı']).toBe(100);
  });

  it('KDV Cikar modunda 1010 TL %1 iin doYru hesaplar', () => {
    const res = calculateKdv(1010, 1, 'cikar');
    expect(res.primaryResult).toBe(1000);
    expect(res.secondaryResults['KDV Tutarı']).toBe(10);
  });

  it('Ozel oran %15 iin ekle modu (1000 TL)', () => {
    const res = calculateKdv(1000, 15, 'ekle');
    expect(res.primaryResult).toBe(1150);
    expect(res.secondaryResults['KDV Tutarı']).toBe(150);
  });
  
  it('Decimal tutarlar iin yuvarlamay doYru yapar (1234.56, %20)', () => {
    const res = calculateKdv(1234.56, 20, 'ekle');
    expect(res.primaryResult).toBe(1481.47);
    expect(res.secondaryResults['KDV Hariç Tutar']).toBe(1234.56);
    expect(res.secondaryResults['KDV Tutarı']).toBe(246.91);
  });

  it('Bylk tutarlar iin doYru hesaplar (1000000, %20 ekle)', () => {
    const res = calculateKdv(1000000, 20, 'ekle');
    expect(res.primaryResult).toBe(1200000);
  });

  it('Tutar 0 olduYunda tm sonuclar 0 olmal', () => {
    const res = calculateKdv(0, 20, 'ekle');
    expect(res.primaryResult).toBe(0);
    expect(res.secondaryResults['KDV Tutarı']).toBe(0);
  });
  
  it('Oran 0 olduYunda KDV tutar 0 olmal', () => {
    const res = calculateKdv(1000, 0, 'ekle');
    expect(res.primaryResult).toBe(1000);
    expect(res.secondaryResults['KDV Tutarı']).toBe(0);
  });
});
