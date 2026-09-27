import { calculateEkpss } from '../ekpss';
import { describe, it, expect } from 'vitest';

describe('EKPSS Calculator', () => {
  it('should calculate 0D/30Y as negative -7.50', () => {
    const res = calculateEkpss('bachelor', 0, 30, 0, 30);
    expect(res.secondaryResults['Genel Yetenek Neti']).toBe('-7,50');
    expect(res.secondaryResults['Genel Kültür Neti']).toBe('-7,50');
    expect(res.primaryResult).toBe('-15,00 Net');
  });

  it('should calculate 1D/4Y as 0 net', () => {
    const res = calculateEkpss('bachelor', 1, 4, 0, 0);
    expect(res.secondaryResults['Genel Yetenek Neti']).toBe('0,00');
    expect(res.primaryResult).toBe('0,00 Net');
  });

  it('should calculate 20D/4Y as 19 net', () => {
    const res = calculateEkpss('bachelor', 20, 4, 0, 0);
    expect(res.secondaryResults['Genel Yetenek Neti']).toBe('19,00');
    expect(res.primaryResult).toBe('19,00 Net');
  });

  it('should calculate 20D/8Y as 18 net', () => {
    const res = calculateEkpss('associate', 20, 8, 0, 0);
    expect(res.secondaryResults['Genel Yetenek Neti']).toBe('18,00');
    expect(res.primaryResult).toBe('18,00 Net');
  });

  it('should calculate 30D/0Y as 30 net and total 60 net', () => {
    const res = calculateEkpss('secondary', 30, 0, 30, 0);
    expect(res.secondaryResults['Genel Yetenek Neti']).toBe('30,00');
    expect(res.secondaryResults['Genel Kültür Neti']).toBe('30,00');
    expect(res.primaryResult).toBe('60,00 Net');
  });

  it('should correctly map score types based on education level', () => {
    expect(calculateEkpss('secondary', 0, 0, 0, 0).secondaryResults['Puan Türü']).toBe('EKPSSP1');
    expect(calculateEkpss('associate', 0, 0, 0, 0).secondaryResults['Puan Türü']).toBe('EKPSSP2');
    expect(calculateEkpss('bachelor', 0, 0, 0, 0).secondaryResults['Puan Türü']).toBe('EKPSSP3');
  });

  it('should throw for exceeding question limit', () => {
    expect(() => calculateEkpss('bachelor', 31, 0, 0, 0)).toThrow();
    expect(() => calculateEkpss('bachelor', 15, 16, 0, 0)).toThrow();
  });

  it('should throw for negative answers', () => {
    expect(() => calculateEkpss('bachelor', 20, -1, 0, 0)).toThrow();
  });
});
