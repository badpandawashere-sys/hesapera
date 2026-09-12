export function calculateVolume(input: {
  sekil: 'Küp' | 'Dikdörtgenler Prizması' | 'Küre' | 'Silindir' | 'Koni';
  birim: 'm' | 'cm';
  kenarA?: number;
  kenarB?: number;
  kenarC?: number;
  yaricap?: number;
  yukseklik?: number;
}) {
  let volume = 0;
  const sekil = input.sekil;
  const unit = input.birim;
  const measures: any = {};
  let islem = "";
  let formul = "";

  const checkPositive = (val: number | undefined) => {
    if (val === undefined || isNaN(val) || !isFinite(val) || val <= 0) {
      throw new Error("Geçersiz veya negatif ölçü girildi.");
    }
    return val;
  };

  const formatNumber = (val: number, decimals: number = 4) => {
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: decimals }).format(val);
  };

  if (sekil === 'Küp') {
    const a = checkPositive(input.kenarA);
    volume = Math.pow(a, 3);
    measures['Kenar (a)'] = `${formatNumber(a)} ${unit}`;
    formul = "a³";
    islem = `${formatNumber(a)}³`;
  } else if (sekil === 'Dikdörtgenler Prizması') {
    const a = checkPositive(input.kenarA);
    const b = checkPositive(input.kenarB);
    const c = checkPositive(input.kenarC);
    volume = a * b * c;
    measures['Uzunluk (a)'] = `${formatNumber(a)} ${unit}`;
    measures['Genişlik (b)'] = `${formatNumber(b)} ${unit}`;
    measures['Yükseklik (c)'] = `${formatNumber(c)} ${unit}`;
    formul = "a × b × c";
    islem = `${formatNumber(a)} × ${formatNumber(b)} × ${formatNumber(c)}`;
  } else if (sekil === 'Küre') {
    const r = checkPositive(input.yaricap);
    volume = (4 / 3) * Math.PI * Math.pow(r, 3);
    measures['Yarıçap (r)'] = `${formatNumber(r)} ${unit}`;
    formul = "4/3 × π × r³";
    islem = `4/3 × π × ${formatNumber(r)}³`;
  } else if (sekil === 'Silindir') {
    const r = checkPositive(input.yaricap);
    const h = checkPositive(input.yukseklik);
    volume = Math.PI * Math.pow(r, 2) * h;
    measures['Yarıçap (r)'] = `${formatNumber(r)} ${unit}`;
    measures['Yükseklik (h)'] = `${formatNumber(h)} ${unit}`;
    formul = "π × r² × h";
    islem = `π × ${formatNumber(r)}² × ${formatNumber(h)}`;
  } else if (sekil === 'Koni') {
    const r = checkPositive(input.yaricap);
    const h = checkPositive(input.yukseklik);
    volume = (1 / 3) * Math.PI * Math.pow(r, 2) * h;
    measures['Yarıçap (r)'] = `${formatNumber(r)} ${unit}`;
    measures['Yükseklik (h)'] = `${formatNumber(h)} ${unit}`;
    formul = "1/3 × π × r² × h";
    islem = `1/3 × π × ${formatNumber(r)}² × ${formatNumber(h)}`;
  } else {
    throw new Error("Bilinmeyen şekil");
  }

  return {
    primaryLabel: 'Hacim',
    primaryResult: `${formatNumber(volume, 6)} ${unit}³`,
    secondaryResults: {
      'Şekil': sekil,
      ...measures
    },
    breakdown: [
      { label: 'Formül', value: formul },
      { label: 'İşlem', value: islem },
      { label: 'Sonuç', value: `${formatNumber(volume, 6)} ${unit}³` }
    ],
    infoReference: {
      title: 'Geometrik Hacim Nedir?',
      description: 'Hacim, üç boyutlu bir cismin uzayda kapladığı alanın (boşluğun) ölçüsüdür ve standart olarak küp (³) birimleriyle ifade edilir.'
    }
  };
}
