export function calculateHmgs(
  system: 'current' | 'legacy',
  hp: number,
  x?: number,
  s?: number,
  b?: number,
  cancelled: number = 0
) {

  if (!Number.isInteger(hp)) {
    return { success: false, errors: { hp: ['Doğru sayısı tam sayı olmalıdır.'] } };
  }
  if (hp < 0 || hp > 120) {
    return { success: false, errors: { hp: ['Doğru sayısı 0-120 arasında olmalıdır.'] } };
  }

  if (system === 'current') {
    const hasX = x !== undefined && x !== null && !Number.isNaN(x);
    const hasS = s !== undefined && s !== null && !Number.isNaN(s);
    const hasB = b !== undefined && b !== null && !Number.isNaN(b);
    const allStatsProvided = hasX && hasS && hasB;
    const partialStats = (hasX || hasS || hasB) && !allStatsProvided;

    if (partialStats) {
      return { success: false, errors: { base: ['Puan hesaplamak için Ortalama Ham Puan, Standart Sapma ve En Yüksek Ham Puan değerlerinin üçünü de giriniz.'] } };
    }

    if (!allStatsProvided) {
      return {
        success: true,
        primaryResult: hp.toString(),
        primaryLabel: 'HMGS Ham Puanı',
        secondaryResults: {
          'Ham Puan': hp.toString(),
        },
        notes: [
          '2026-HMGS/2 ve sonrasında HMGS puanı; adayların ham puan ortalaması, standart sapması ve sınavdaki en yüksek ham puan kullanılarak hesaplanır. Bu istatistikler olmadan kesin HMGS puanı hesaplanamaz.',
        ]
      };
    }

    if (x! < 0 || x! > 120 || !Number.isFinite(x)) {
      return { success: false, errors: { x: ['Geçersiz Ortalama Ham Puan (X).'] } };
    }
    if (s! <= 0 || s! > 120 || !Number.isFinite(s)) {
      return { success: false, errors: { s: ['Geçersiz Standart Sapma (S). S > 0 olmalıdır.'] } };
    }
    if (b! < 0 || b! > 120 || !Number.isFinite(b)) {
      return { success: false, errors: { b: ['Geçersiz En Yüksek Ham Puan (B).'] } };
    }
    if (b! < hp) {
      return { success: false, errors: { b: ['En Yüksek Ham Puan (B), kendi ham puanınızdan küçük olamaz.'] } };
    }
    if (b! <= x!) {
      return { success: false, errors: { b: ['En Yüksek Ham Puan (B), Ortalamadan (X) büyük olmalıdır.'] } };
    }

    const den = 7 * (b! - x!) - s!;
    if (den <= 0) {
      return { success: false, errors: { base: ['Geçersiz istatistikler. 7 × (B - X) - S > 0 olmalıdır.'] } };
    }

    const num = 7 * (hp - x!) - s!;
    const score = 70 + 30 * (num / den);

    const formatScore = (val: number) => {
      return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 5 }).format(val);
    };

    return {
      success: true,
      primaryResult: formatScore(score),
      primaryLabel: 'HMGS Puanı',
      secondaryResults: {
        'Ham Puan': hp.toString(),
        'Başarı Durumu': score >= 70 ? '70 puanlık başarı eşiğinin üzerinde' : '70 puanlık başarı eşiğinin altında'
      },
      notes: [
        'Formül: HMGS Puanı = 70 + 30 × [7 × (HP - X) - S] / [7 × (B - X) - S]',
      ]
    };
  }

  // Legacy
  if (!Number.isInteger(cancelled) || cancelled < 0 || cancelled >= 120) {
    return { success: false, errors: { cancelled: ['İptal edilen soru sayısı geçerli değil.'] } };
  }

  const validQuestions = 120 - cancelled;
  if (hp > validQuestions) {
    return { success: false, errors: { hp: ['İptal edilen sorular çıkarıldığında maksimum doğru sayısı ' + validQuestions + ' olabilir.'] } };
  }

  const score = (hp * 100) / validQuestions;

  const formatScore = (val: number) => {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 5 }).format(val);
  };

  return {
    success: true,
    primaryResult: formatScore(score),
    primaryLabel: 'HMGS Puanı',
    secondaryResults: {
      'Geçerli Soru Sayısı': validQuestions.toString(),
      'Doğru Sayısı': hp.toString(),
    },
    notes: [
      '2026-HMGS/1 ve öncesi oransal sisteme göre hesaplanmıştır. İptal edilen sorular geçerli soru sayısından düşülerek 100 üzerinden orantılanır.'
    ]
  };
}
