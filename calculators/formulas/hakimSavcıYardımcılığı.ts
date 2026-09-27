interface HakimTestInput {
  correct?: number;
  wrong?: number;
}

interface HakimSavciInput {
  gygk: HakimTestInput;
  ortak: HakimTestInput;
  adli?: HakimTestInput;
  idari?: HakimTestInput;
  avukat?: HakimTestInput;
}

export function calculateHakimSavci(input: HakimSavciInput) {
  const calcNet = (test?: HakimTestInput) => {
    if (!test) return null;
    if (test.correct === undefined && test.wrong === undefined) return null;
    const c = test.correct || 0;
    const w = test.wrong || 0;
    return c - (w / 4);
  };

  const gygkNet = calcNet(input.gygk) || 0;
  const ortakNet = calcNet(input.ortak) || 0;

  const adliNet = calcNet(input.adli);
  const idariNet = calcNet(input.idari);
  const avukatNet = calcNet(input.avukat);

  const hasOptional = adliNet !== null || idariNet !== null || avukatNet !== null;

  const secondaryResults: Record<string, string | number> = {
    'Genel Yetenek ve Genel Kültür Neti': gygkNet.toFixed(2),
    'Ortak Alan Bilgisi Neti': ortakNet.toFixed(2)
  };

  const formatNet = (n: number) => n.toFixed(2).replace('.', ',');
  const formatPuan = (p: number) => p.toFixed(3).replace('.', ',');

  let primaryText = '';

  const notes: string[] = [
    'Bu sonuç tahminidir. ÖSYM\'nin resmî puanı, sınava katılan adayların alt testlerdeki ham puan ortalamaları ve standart sapmaları kullanılarak hesaplanan standart puanlara göre belirlenir.'
  ];

  const processOzelAlan = (name: string, ozelNet: number | null) => {
    if (ozelNet === null) return;

    secondaryResults[`${name} Neti`] = formatNet(ozelNet);

    const toplamNet = gygkNet + ortakNet + ozelNet;
    secondaryResults[`${name} Toplam Net`] = formatNet(toplamNet);

    const gygkKatkisi = (gygkNet / 30) * 20;
    const alanKatkisi = ((ortakNet + ozelNet) / 70) * 80;
    const tahminiPuan = gygkKatkisi + alanKatkisi;

    secondaryResults[`${name} Tahmini Genel Başarı Puanı`] = formatPuan(tahminiPuan);

    const status = tahminiPuan >= 70 ? '70 puanlık temel başarı eşiğinin üzerinde' : '70 puanlık temel başarı eşiğinin altında';
    notes.push(`${name}: ${status}`);

    if (!primaryText) {
      primaryText = `${name}: ${formatPuan(tahminiPuan)}`;
    } else {
      primaryText += ` | ${name}: ${formatPuan(tahminiPuan)}`;
    }
  };

  processOzelAlan('Adli Yargı', adliNet);
  processOzelAlan('İdari Yargı', idariNet);
  processOzelAlan('Adli Yargı-Avukat', avukatNet);

  if (!hasOptional) {
    primaryText = 'Lütfen en az bir özel alan (Adli, İdari veya Avukat) giriniz.';
  }

  return {
    primaryResult: primaryText,
    secondaryResults,
    notes
  };
}
