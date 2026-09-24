export function calculateZamHesaplama(input: any) {
  const mod = input.mod;
  
  if (mod === 'zam-ekle') {
    const eskiFiyat = input.eskiFiyat || 0;
    const zamOrani = input.zamOrani || 0;
    
    const zamTutari = (eskiFiyat * zamOrani) / 100;
    const yeniFiyat = eskiFiyat + zamTutari;
    
    return {
      primaryResult: yeniFiyat,
      secondaryResults: {
        'Zam Tutarı': zamTutari,
        'Zam Oranı': '%' + zamOrani
      }
    };
  } 
  else if (mod === 'oran-bul') {
    const eskiFiyat = input.eskiFiyat || 0;
    const yeniFiyat = input.yeniFiyat || 0;
    
    let artis = yeniFiyat - eskiFiyat;
    let zamOrani = 0;
    if (eskiFiyat > 0) {
      zamOrani = (artis / eskiFiyat) * 100;
    }
    
    return {
      primaryResult: zamOrani, // formatted as % in UI
      secondaryResults: {
        'Artış Tutarı': artis,
        'Yeni Fiyat': yeniFiyat
      }
    };
  }
  else if (mod === 'eski-fiyat-bul') {
    const yeniFiyat = input.yeniFiyat || 0;
    const zamOrani = input.zamOrani || 0;
    
    let eskiFiyat = 0;
    if (zamOrani >= 0) {
      eskiFiyat = yeniFiyat / (1 + (zamOrani / 100));
    }
    
    const zamTutari = yeniFiyat - eskiFiyat;
    
    return {
      primaryResult: eskiFiyat,
      secondaryResults: {
        'Zam Tutarı': zamTutari,
        'Yeni Fiyat': yeniFiyat
      }
    };
  }
  
  return {
    primaryResult: 0,
    secondaryResults: {}
  };
}
