import { validateExamInputs } from './exams/core';

export interface LgsTestInput {
  turkceC: number; turkceW: number;
  matematikC: number; matematikW: number;
  fenC: number; fenW: number;
  inkilapC: number; inkilapW: number;
  dinC: number; dinW: number;
  dinMuaf?: boolean;
  yabanciDilC: number; yabanciDilW: number;
  yabanciDilMuaf?: boolean;
}

const MAX_QUESTIONS: Record<string, number> = {
  turkce: 20, matematik: 20, fen: 20, inkilap: 10, din: 10, yabanciDil: 10
};

function lgsNet(correct: number, wrong: number, max: number, isMuaf: boolean = false): number | null {
  if (isMuaf) return null;
  // validateExamInputs(correct, wrong, max - correct - wrong, max);
  // NEGATIVE CLAMP YOK. Örnek: 0 doğru 20 yanlış -> -6.666...
  return correct - (wrong / 3);
}

export function calculateLgs(inp: LgsTestInput) {
  const nets = {
    turkce: lgsNet(inp.turkceC, inp.turkceW, MAX_QUESTIONS.turkce),
    matematik: lgsNet(inp.matematikC, inp.matematikW, MAX_QUESTIONS.matematik),
    fen: lgsNet(inp.fenC, inp.fenW, MAX_QUESTIONS.fen),
    inkilap: lgsNet(inp.inkilapC, inp.inkilapW, MAX_QUESTIONS.inkilap),
    din: lgsNet(inp.dinC, inp.dinW, MAX_QUESTIONS.din, inp.dinMuaf),
    yabanciDil: lgsNet(inp.yabanciDilC, inp.yabanciDilW, MAX_QUESTIONS.yabanciDil, inp.yabanciDilMuaf)
  };

  let totalNet = 0;
  Object.values(nets).forEach(val => {
    if (val !== null) totalNet += val;
  });

  const formatNet = (val: number | null, max: number) => {
    if (val === null) return 'Muaf';
    return val.toFixed(2) + ' / ' + max;
  };

  const secondaryResults: Record<string, string> = {
    'Türkçe Neti': formatNet(nets.turkce, 20),
    'Matematik Neti': formatNet(nets.matematik, 20),
    'Fen Bilimleri Neti': formatNet(nets.fen, 20),
    'İnkılap Neti': formatNet(nets.inkilap, 10),
    'Din Kültürü Neti': formatNet(nets.din, 10),
    'Yabancı Dil Neti': formatNet(nets.yabanciDil, 10),
    'Toplam Net': totalNet.toFixed(2)
  };

  const notes = [
    "2026 LGS (Liselere Geçiş Sistemi) Merkezî Sınavı'nda 3 yanlış 1 doğruyu götürmektedir.",
    "Kesin Merkezî Sınav Puanı yalnız doğru ve yanlış sayılarından hesaplanamaz. MEB her alt testin ham puanını (netini) sınava giren öğrencilerin test ortalaması ve standart sapmasına göre standart puana (SP) dönüştürür. Bu standart puanlar resmî ders katsayılarıyla ağırlıklandırılarak TASP oluşturulur ve TASP sınav yılındaki en küçük/en büyük TASP değerleriyle 100-500 ölçeğine dönüştürülür.",
    "MEB Resmî Ağırlık Katsayıları: Türkçe ×4, Matematik ×4, Fen Bilimleri ×4, T.C. İnkılap Tarihi ×1, Din Kültürü ×1, Yabancı Dil ×1."
  ];

  if (inp.dinMuaf || inp.yabanciDilMuaf) {
    notes.push("Muafiyet durumunda MEB, eksik testin ağırlıklı standart puanını diğer testlerin performansına göre özel formülle hesaplar.");
  }

  return {
    primaryResult: totalNet.toFixed(2) + " Net",
    secondaryResults,
    notes
  };
}
