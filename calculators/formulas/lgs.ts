import { validateExamInputs } from './exams/core';

// LGS — Liselere Giriş Sınavı (MEB)
// Kaynak: 2026 LGS Kılavuzu, Millî Eğitim Bakanlığı (meb.gov.tr)
//
// Sınav yapısı (resmi 2026 kılavuzu):
//   Türkçe                            : 20 soru
//   Matematik                         : 20 soru
//   Fen Bilimleri                     : 20 soru
//   T.C. İnkılap Tarihi ve Atatürkçülük: 10 soru
//   Din Kültürü ve Ahlak Bilgisi      : 10 soru
//   Yabancı Dil (İngilizce)           : 10 soru
//   TOPLAM                            : 90 soru
//
// Ham Puan (HP) = Doğru - Yanlış / 3  (Her 3 yanlış 1 doğruyu götürür)
//
// Nihai LGS puanı: 100-500 aralığında standardize edilir.
// Standart puan MEB'in yıllık aday ortalaması ve standart sapmasına dayandığı için
// gerçek popülasyon verileri olmadan kesin değer hesaplanamaz.

export interface LgsTestInput {
  turkceC: number; turkceW: number;
  matematikC: number; matematikW: number;
  fenC: number; fenW: number;
  inkılapC: number; inkılapW: number;
  dinC: number; dinW: number;
  yabancıDilC: number; yabancıDilW: number;
}

const MAX_QUESTIONS: Record<string, number> = {
  turkce: 20, matematik: 20, fen: 20, inkılap: 10, din: 10, yabancıDil: 10
};

function lgsNet(correct: number, wrong: number, max: number): number {
  validateExamInputs(correct, wrong, max - correct - wrong, max);
  return Math.max(0, correct - wrong / 3);
}

export function calculateLgs(inp: LgsTestInput) {
  const nets = {
    turkce: lgsNet(inp.turkceC, inp.turkceW, MAX_QUESTIONS.turkce),
    matematik: lgsNet(inp.matematikC, inp.matematikW, MAX_QUESTIONS.matematik),
    fen: lgsNet(inp.fenC, inp.fenW, MAX_QUESTIONS.fen),
    inkılap: lgsNet(inp.inkılapC, inp.inkılapW, MAX_QUESTIONS.inkılap),
    din: lgsNet(inp.dinC, inp.dinW, MAX_QUESTIONS.din),
    yabancıDil: lgsNet(inp.yabancıDilC, inp.yabancıDilW, MAX_QUESTIONS.yabancıDil)
  };

  const maxTotal = 90;
  const totalNet = Object.values(nets).reduce((a, b) => a + b, 0);

  // Yaklaşık puan: 100-500 aralığına oransal dönüşüm
  const approxScore = 100 + (totalNet / maxTotal) * 400;

  return {
    primaryResult: approxScore.toFixed(0),
    secondaryResults: {
      'Türkçe Net': nets.turkce.toFixed(2) + ' / 20',
      'Matematik Net': nets.matematik.toFixed(2) + ' / 20',
      'Fen Bilimleri Net': nets.fen.toFixed(2) + ' / 20',
      'İnkılap Tarihi Net': nets.inkılap.toFixed(2) + ' / 10',
      'Din Kültürü Net': nets.din.toFixed(2) + ' / 10',
      'Yabancı Dil Net': nets.yabancıDil.toFixed(2) + ' / 10',
      'Toplam Net': totalNet.toFixed(2) + ' / 90'
    },
    notes: [
      "2026 LGS (Liselere Giriş Sınavı), MEB tarafından uygulanmaktadır. Her testte 3 yanlış 1 doğruyu götürmektedir.",
      "Gösterilen skor (100-500) yaklaşık değerdir. Gerçek LGS puanı MEB'in yıllık aday ortalaması ve standart sapmasını kullanarak hesapladığı standart puana dayalıdır.",
      "Kaynak: 2026 LGS Kılavuzu, Millî Eğitim Bakanlığı (meb.gov.tr)"
    ]
  };
}