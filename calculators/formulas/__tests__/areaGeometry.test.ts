import { calculateAreaGeometry } from '../areaGeometry';
import { describe, it, expect } from 'vitest';

describe('Area Geometry Formula', () => {
  it('should calculate square', () => {
    const res = calculateAreaGeometry({ shape: 'square', side: 5 });
    expect(res.primaryResult).toBe('25.0000 m²');
  });
  it('should calculate rectangle', () => {
    const res = calculateAreaGeometry({ shape: 'rectangle', length: 5, width: 10 });
    expect(res.primaryResult).toBe('50.0000 m²');
  });
  it('should calculate triangle', () => {
    const res = calculateAreaGeometry({ shape: 'triangle', base: 10, height: 4 });
    expect(res.primaryResult).toBe('20.0000 m²');
  });
  it('should calculate circle', () => {
    const res = calculateAreaGeometry({ shape: 'circle', radius: 2 });
    expect(res.primaryResult.startsWith('12.5664')).toBe(true);
  });
});