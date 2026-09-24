export function calculateKarMarji(input: any) {
  const mod = input.mod;
  const maliyet = input.maliyet || 0;
  
  if (mod === 'kar-zarar') {
    const satisFiyati = input.satisFiyati || 0;
    const karZararTutari = satisFiyati - maliyet;
    
    let karOrani = 0;
    let karMarji = 0;
    
    if (maliyet > 0) {
      karOrani = (karZararTutari / maliyet) * 100;
    }
    
    if (satisFiyati > 0) {
      karMarji = (karZararTutari / satisFiyati) * 100;
    }
    
    let durum = 'Başabaş';
    if (karZararTutari > 0) durum = 'Kâr';
    else if (karZararTutari < 0) durum = 'Zarar';
    
    return {
      primaryResult: karZararTutari,
      secondaryResults: {
        'Kâr Oranı': '%' + (Math.round(karOrani * 10000) / 10000),
        'Kâr Marjı': '%' + (Math.round(karMarji * 10000) / 10000),
        'Durum': durum
      }
    };
  } 
  else if (mod === 'hedef-marj') {
    const hedefMarj = input.hedefMarj || 0;
    let satisFiyati = 0;
    
    if (hedefMarj < 100) {
      satisFiyati = maliyet / (1 - (hedefMarj / 100));
    } else {
      // 100% or above margin means infinity, but just safeguard it
      satisFiyati = 0;
    }
    
    const karTutari = satisFiyati - maliyet;
    
    return {
      primaryResult: satisFiyati,
      secondaryResults: {
        'Kâr Tutarı': karTutari,
        'Hedef Marj': '%' + hedefMarj
      }
    };
  }
  else if (mod === 'kar-orani') {
    const karOrani = input.karOrani || 0;
    
    const karTutari = (maliyet * karOrani) / 100;
    const satisFiyati = maliyet + karTutari;
    
    let gercekMarj = 0;
    if (satisFiyati > 0) {
      gercekMarj = (karTutari / satisFiyati) * 100;
    }
    
    return {
      primaryResult: satisFiyati,
      secondaryResults: {
        'Kâr Tutarı': karTutari,
        'Gerçek Kâr Marjı': '%' + (Math.round(gercekMarj * 10000) / 10000)
      }
    };
  }
  
  return {
    primaryResult: 0,
    secondaryResults: {}
  };
}
