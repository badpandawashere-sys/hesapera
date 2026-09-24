export function calculateIndirim(input: any) {
  const mod = input.mod;
  const normalFiyat = input.normalFiyat || 0;
  
  if (mod === 'yuzde') {
    const oran = input.indirimOrani || 0;
    const indirimTutari = (normalFiyat * oran) / 100;
    const sonFiyat = normalFiyat - indirimTutari;
    
    return {
      primaryResult: sonFiyat,
      secondaryResults: {
        'İndirim Tutarı': indirimTutari,
        'İndirim Oranı': '%' + oran
      }
    };
  } 
  else if (mod === 'oran-bul') {
    const sonFiyat = input.indirimliFiyat || 0;
    
    let indirimTutari = normalFiyat - sonFiyat;
    let oran = 0;
    if (normalFiyat > 0) {
      oran = (indirimTutari / normalFiyat) * 100;
    }
    
    return {
      primaryResult: oran, // will be formatted with % on UI
      secondaryResults: {
        'İndirim Tutarı': indirimTutari,
        'İndirimli Fiyat': sonFiyat
      }
    };
  }
  else if (mod === 'coklu') {
    const oran1 = input.indirimOrani || 0;
    const oran2 = input.ikinciIndirimOrani || 0;
    
    const indirimTutari1 = (normalFiyat * oran1) / 100;
    const araFiyat = normalFiyat - indirimTutari1;
    
    const indirimTutari2 = (araFiyat * oran2) / 100;
    const sonFiyat = araFiyat - indirimTutari2;
    
    const toplamTasarruf = normalFiyat - sonFiyat;
    
    let efektifOran = 0;
    if (normalFiyat > 0) {
      efektifOran = (toplamTasarruf / normalFiyat) * 100;
    }
    
    return {
      primaryResult: sonFiyat,
      secondaryResults: {
        'Toplam Tasarruf': toplamTasarruf,
        'Efektif İndirim Oranı': '%' + (Math.round(efektifOran * 100) / 100)
      }
    };
  }
  
  return {
    primaryResult: 0,
    secondaryResults: {}
  };
}
