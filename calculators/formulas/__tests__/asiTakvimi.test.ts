import { describe, it, expect } from 'vitest';
import { calculateAsiTakvimi } from '../asiTakvimi';

describe('Asi Takvimi Calculator', () => {
  it('should return birth vaccines for newborn', () => {
    // Born 2026-10-01, checking on 2026-10-01
    const res = calculateAsiTakvimi({ dogumTarihi: '2026-10-01', referansTarihi: '2026-10-01' });
    expect(res.secondaryResults['Bebeğin Ayı']).toBe('0 Aylık');
    expect(res.secondaryResults['Şu Anki / Yaklaşan Aşılar']).toContain('Hepatit B');
    expect(res.primaryResult).toBe('0. Ay Aşı Dönemi');
  });

  it('should return 48th month including Sucicegi 2. doz (1 Sept 2026 rule)', () => {
    // Born 2022-10-01, checking on 2026-10-01 (48 months old = 4 years)
    const res = calculateAsiTakvimi({ dogumTarihi: '2022-10-01', referansTarihi: '2026-10-01' });
    expect(res.secondaryResults['Bebeğin Ayı']).toBe('48 Aylık');
    expect(res.secondaryResults['Şu Anki / Yaklaşan Aşılar']).toContain('Suçiçeği');
    expect(res.secondaryResults['Şu Anki / Yaklaşan Aşılar']).toContain('Dörtlü Karma');
  });

  it('should show completed after 48 months', () => {
    // Born 2020-01-01, checking on 2026-10-01 (approx 81 months)
    const res = calculateAsiTakvimi({ dogumTarihi: '2020-01-01', referansTarihi: '2026-10-01' });
    expect(res.primaryResult).toBe('Rutin Ulusal Çocukluk Aşıları Tamamlandı');
  });

  it('should show upcoming milestone if currently in an empty month', () => {
    // Born 2026-08-01, checking on 2026-11-01 (3 months old)
    // There are no vaccines at 3 months. Next is 4.
    const res = calculateAsiTakvimi({ dogumTarihi: '2026-08-01', referansTarihi: '2026-11-01' });
    expect(res.secondaryResults['Bebeğin Ayı']).toBe('3 Aylık');
    expect(res.primaryResult).toBe('4. Ay Aşı Dönemi');
    expect(res.secondaryResults['Şu Anki / Yaklaşan Aşılar']).toContain('Beşli Karma');
    expect(res.secondaryResults['Sonraki Dönem']).toBe('6. Ay');
  });

  it('should throw on future birth', () => {
    expect(() => calculateAsiTakvimi({ dogumTarihi: '2027-01-01', referansTarihi: '2026-10-01' })).toThrow();
  });
});
