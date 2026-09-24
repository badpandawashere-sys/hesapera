export function calculateKdv(tutar: number, oran: number, mod: 'ekle' | 'cikar') {
  let netTutar = 0;
  let kdvTutari = 0;
  let kdvDahil = 0;

  if (mod === 'ekle') {
    netTutar = tutar;
    kdvTutari = netTutar * (oran / 100);
    kdvDahil = netTutar + kdvTutari;
  } else {
    kdvDahil = tutar;
    netTutar = kdvDahil / (1 + (oran / 100));
    kdvTutari = kdvDahil - netTutar;
  }

  // To avoid floating point issues, let's round everything to 2 decimals
  netTutar = Math.round(netTutar * 100) / 100;
  kdvTutari = Math.round(kdvTutari * 100) / 100;
  kdvDahil = Math.round(kdvDahil * 100) / 100;

  return {
    primaryResult: mod === 'ekle' ? kdvDahil : netTutar,
    secondaryResults: {
      'KDV Hariç Tutar': netTutar,
      'KDV Tutarı': kdvTutari,
      'KDV Dahil Tutar': kdvDahil,
      'KDV Oranı': '%' + oran
    }
  };
}
