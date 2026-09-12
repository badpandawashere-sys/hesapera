const MILE_TO_KM = 1.609344;
const MILE_TO_M = 1609.344;
const KM_TO_MILE = 1 / MILE_TO_KM;
const M_TO_MILE = 1 / MILE_TO_M;

export function calculateMil(miktar: number, birim: 'mil' | 'km' | 'm') {
  if (isNaN(miktar) || !isFinite(miktar) || miktar < 0) {
    throw new Error("Geçersiz veya negatif değer girildi.");
  }

  let milVal = 0;
  let kmVal = 0;
  let mVal = 0;

  if (birim === 'mil') {
    milVal = miktar;
    kmVal = miktar * MILE_TO_KM;
    mVal = miktar * MILE_TO_M;
  } else if (birim === 'km') {
    kmVal = miktar;
    milVal = miktar * KM_TO_MILE;
    mVal = miktar * 1000;
  } else if (birim === 'm') {
    mVal = miktar;
    kmVal = miktar / 1000;
    milVal = miktar * M_TO_MILE;
  }

  const formatNumber = (val: number, maxDecimals: number = 2) => {
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: maxDecimals }).format(val);
  };

  const formatExact = (val: number) => {
    const s = val.toString();
    if (s.includes('e')) {
      return val.toLocaleString('tr-TR', { maximumFractionDigits: 10 });
    }
    const parts = s.split('.');
    if (parts.length > 1) {
      return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: Math.max(2, parts[1].length) }).format(val);
    }
    return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(val);
  }

  let primaryLabel = 'Sonuç';
  let primaryResult = '';
  
  if (birim === 'mil') {
    primaryResult = `${formatExact(miktar)} mi = ${formatExact(kmVal)} km`;
  } else if (birim === 'km') {
    primaryResult = `${formatExact(miktar)} km = ${formatExact(milVal)} mi`;
  } else {
    primaryResult = `${formatExact(miktar)} m = ${formatExact(milVal)} mi`;
  }

  return {
    primaryLabel,
    primaryResult,
    secondaryResults: {
      'Mil (mi)': `${formatExact(milVal)} mi`,
      'Kilometre (km)': `${formatExact(kmVal)} km`,
      'Metre (m)': `${formatExact(mVal)} m`
    },
    breakdown: [
      { label: 'Girilen Değer', value: `${formatExact(miktar)} ${birim}` },
      { label: 'Mil Karşılığı', value: `${formatExact(milVal)} mi` },
      { label: 'Kilometre Karşılığı', value: `${formatExact(kmVal)} km` },
      { label: 'Metre Karşılığı', value: `${formatExact(mVal)} m` }
    ],
    infoReference: {
      title: 'Dönüşüm Katsayıları',
      description: 'Hesaplamalarda uluslararası geçerliliği olan 1 mil = 1,609344 km (veya 1609,344 m) sabit katsayısı kullanılmaktadır. Ters dönüşüm için 1 km ≈ 0,621371 mil yaklaşımı baz alınır.'
    }
  };
}
