import { calculateAks } from '../aks';
import { describe, it, expect } from 'vitest';

describe('AKS Calculator', () => {
  it('should calculate passing score', () => {
    const res = calculateAks(60, 40);
    expect(res.primaryResult).toBe('60.00');
    expect(res.secondaryResults['Değerlendirme']).toBe('Başarılı');
  });

  it('should calculate failing score', () => {
    const res = calculateAks(59, 0);
    expect(res.primaryResult).toBe('59.00');
    expect(res.secondaryResults['Değerlendirme']).toBe('Başarısız');
  });
});