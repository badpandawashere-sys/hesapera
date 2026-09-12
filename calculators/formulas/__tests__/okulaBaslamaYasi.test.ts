import { describe, it, expect } from 'vitest';
import { calculateOkulaBaslamaYasi } from '../okulaBaslamaYasi';

describe('Okula Baslama Yasi Calculator', () => {
  it('should be 72 months and mandatory', () => {
    // Born Sept 2020, Enrollment Sept 2026 -> 72 months
    const res = calculateOkulaBaslamaYasi({ dogumAy: 9, dogumYil: 2020, egitimYili: 2026 });
    expect(res.secondaryResults['Eylül Sonu İtibarıyla Yaşı']).toContain('72 Aylık');
    expect(res.primaryResult).toContain('Zorunlu');
  });

  it('should be 69 months and mandatory but can be postponed', () => {
    // Born Dec 2020 (12), Enrollment Sept 2026 -> (2026-2020)*12 + 9 - 12 = 72 - 3 = 69
    const res = calculateOkulaBaslamaYasi({ dogumAy: 12, dogumYil: 2020, egitimYili: 2026 });
    expect(res.secondaryResults['Eylül Sonu İtibarıyla Yaşı']).toContain('69 Aylık');
    expect(res.primaryResult).toContain('Erteleme Hakkı');
  });

  it('should be 66 months and optional', () => {
    // Born March 2021 (3), Enrollment Sept 2026 -> (2026-2021)*12 + 9 - 3 = 60 + 6 = 66
    const res = calculateOkulaBaslamaYasi({ dogumAy: 3, dogumYil: 2021, egitimYili: 2026 });
    expect(res.secondaryResults['Eylül Sonu İtibarıyla Yaşı']).toContain('66 Aylık');
    expect(res.primaryResult).toContain('Anaokuluna Kayıtlı (İsteğe Bağlı İlkokul)');
  });

  it('should be 57 months and preschool', () => {
    // Born Dec 2021 (12), Enrollment Sept 2026 -> (2026-2021)*12 + 9 - 12 = 60 - 3 = 57
    const res = calculateOkulaBaslamaYasi({ dogumAy: 12, dogumYil: 2021, egitimYili: 2026 });
    expect(res.secondaryResults['Eylül Sonu İtibarıyla Yaşı']).toContain('57 Aylık');
    expect(res.primaryResult).toContain('Okul Öncesi Eğitim');
  });

  it('should throw on invalid dates', () => {
    expect(() => calculateOkulaBaslamaYasi({ dogumAy: 13, dogumYil: 2020, egitimYili: 2026 })).toThrow();
    expect(() => calculateOkulaBaslamaYasi({ dogumAy: 9, dogumYil: 2027, egitimYili: 2026 })).toThrow(); // Future birth
  });
});
