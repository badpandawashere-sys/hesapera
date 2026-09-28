export interface HakimSavciInput {
  gygk: { correct?: number; wrong?: number };
  ortak: { correct?: number; wrong?: number };
  adli: { correct?: number; wrong?: number };
  idari: { correct?: number; wrong?: number };
  avukat: { correct?: number; wrong?: number };
}

export function calculateHakimSavci(input: HakimSavciInput) {
  const gygkC = input.gygk.correct || 0;
  const gygkW = input.gygk.wrong || 0;
  const ortakC = input.ortak.correct || 0;
  const ortakW = input.ortak.wrong || 0;

  const gygkNet = gygkC - (gygkW / 4);
  const ortakNet = ortakC - (ortakW / 4);

  const results: any[] = [];
  const notes: string[] = [];

  results.push(
    { label: 'Genel Yetenek ve Genel Kültür Neti', value: gygkNet.toFixed(2) },
    { label: 'Ortak Alan Bilgisi Neti', value: ortakNet.toFixed(2) }
  );

  let hasSpecial = false;

  if (input.adli.correct !== undefined || input.adli.wrong !== undefined) {
    hasSpecial = true;
    const adliC = input.adli.correct || 0;
    const adliW = input.adli.wrong || 0;
    const adliNet = adliC - (adliW / 4);
    results.push({ label: 'Adli Yargı Neti', value: adliNet.toFixed(2) });
    const totalNet = gygkNet + ortakNet + adliNet;
    results.push({ label: 'Adli Yargı Toplam Net', value: totalNet.toFixed(2) });
  }

  if (input.idari.correct !== undefined || input.idari.wrong !== undefined) {
    hasSpecial = true;
    const idariC = input.idari.correct || 0;
    const idariW = input.idari.wrong || 0;
    const idariNet = idariC - (idariW / 4);
    results.push({ label: 'İdari Yargı Neti', value: idariNet.toFixed(2) });
    const totalNet = gygkNet + ortakNet + idariNet;
    results.push({ label: 'İdari Yargı Toplam Net', value: totalNet.toFixed(2) });
  }

  if (input.avukat.correct !== undefined || input.avukat.wrong !== undefined) {
    hasSpecial = true;
    const avukatC = input.avukat.correct || 0;
    const avukatW = input.avukat.wrong || 0;
    const avukatNet = avukatC - (avukatW / 4);
    results.push({ label: 'Adli Yargı-Avukat Neti', value: avukatNet.toFixed(2) });
    const totalNet = gygkNet + ortakNet + avukatNet;
    results.push({ label: 'Adli Yargı-Avukat Toplam Net', value: totalNet.toFixed(2) });
  }

  notes.push("ÖSYM'nin resmî Genel Başarı Puanı, Genel Yetenek ve Genel Kültür testindeki 5 alt test ile Alan Bilgisi testindeki 12 alt testin ayrı ayrı standartlaştırılmasıyla hesaplanır. Sınava giren adayların ortalama ve standart sapma değerleri de hesaplamaya dahil edildiğinden yalnızca toplam doğru ve yanlış sayılarıyla kesin Genel Başarı Puanı hesaplanamaz.");

  return {
    primaryResult: hasSpecial ? 'Hesaplama Tamamlandı' : 'En az bir özel alan testi (Adli Yargı, İdari Yargı veya Adli Yargı-Avukat) seçmelisiniz.',
    results,
    notes
  };
}
