export function calculateEusNet(correct: number, wrong: number): number {
  return correct - (wrong / 4);
}

export function calculateEus(
  katsayi: string,
  durum: string,
  dogru: number,
  yanlis: number | undefined
) {
  let net = 0;
  let hasWrong = yanlis !== undefined;

  if (hasWrong) {
    net = calculateEusNet(dogru, yanlis!);
  } else {
    net = dogru; // directly treated as net
  }

  const EUS_KATSAYI = 0.8921402666666667;
  const EUS_TABAN = 26.08172;

  let rawScore = EUS_TABAN + (net * EUS_KATSAYI);

  const isPenalty = durum === '1' || durum === '2' || durum === '3';
  if (isPenalty) {
    rawScore = parseFloat(rawScore.toFixed(5)) * 0.98;
  }

  const resultNotes = [
    '2026-EUS (Eczacılıkta Uzmanlık Eğitimi Giriş Sınavı), ÖSYM tarafından uygulanmaktadır. Sınav 75 sorudan oluşmakta olup her 4 yanlış 1 doğruyu götürmektedir.',
    'Gösterilen puan seçilen yılın istatistiklerine göre hesaplanmış tahmini bir değerdir. Kesin EUS puanı, sınava giren tüm adayların istatistiksel parametreleri (ortalama ve standart sapma) ile belirleneceğinden resmi sonucunuz farklılık gösterebilir.'
  ];

  if (isPenalty) {
    resultNotes.unshift('Bilgi: Uzmanlık eğitimine devam etmekte iken sınava girdiğiniz veya diğer kesinti durumlarına dâhil olduğunuz için puanınız %2 oranında düşürülmüştür.');
  }

  return {
    primaryResult: rawScore.toFixed(5).replace('.', ','),
    secondaryResults: {
      'Net': net.toFixed(2).replace('.', ',') + ' net'
    },
    notes: resultNotes
  };
}
