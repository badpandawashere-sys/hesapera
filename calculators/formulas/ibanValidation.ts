export function calculateIbanValidation(iban: string) {
  if (!iban || typeof iban !== 'string' || iban.trim() === '') {
    return { success: false, errors: ['Lütfen bir IBAN numarası giriniz.'] };
  }

  // Yalnızca normal boşlukları kaldır
  const noSpaceIban = iban.replace(/\s+/g, '');
  
  // Sadece harf ve rakam kontrolü yap (özel karakter, tire, slash vs reddet)
  const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(noSpaceIban);
  if (!isAlphanumeric) {
    return {
      success: true,
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: { 
        'Girilen IBAN': iban.length > 30 ? iban.substring(0, 30) + '...' : iban,
        'Hata Nedeni': 'IBAN geçersiz karakter içeriyor (tire, slash, özel karakter veya Türkçe karakter kullanılamaz).' 
      },
      notes: []
    };
  }

  const normalized = noSpaceIban.toUpperCase();
  
  // Maskelenmiş IBAN
  const maskIban = (str: string) => {
    if (!str || str.length < 6) return str || '';
    const first4 = str.substring(0, 4);
    const last2 = str.substring(str.length - 2);
    const maskedLen = str.length - 6;
    const asterisks = '*'.repeat(maskedLen);
    const chunks = asterisks.match(/.{1,4}/g);
    const maskedCore = chunks ? chunks.join(' ') : asterisks;
    return first4 + ' ' + maskedCore + ' ' + last2;
  };

  const IBAN_LENGTHS: Record<string, number> = {
    AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BY: 28, BE: 16, BA: 20, BR: 29, BG: 22,
    CR: 22, HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28, EE: 20, FO: 18, FI: 18, FR: 27,
    GE: 22, DE: 22, GI: 23, GR: 27, GL: 18, GT: 28, HU: 28, IS: 26, IE: 22, IL: 23,
    IT: 27, JO: 30, KZ: 20, XK: 20, KW: 30, LV: 21, LB: 28, LI: 21, LT: 20, LU: 20,
    MT: 31, MR: 27, MU: 30, MD: 24, MC: 27, ME: 22, NL: 18, MK: 19, NO: 15, PK: 24,
    PS: 29, PL: 28, PT: 25, QA: 29, RO: 24, SM: 27, SA: 24, RS: 22, SK: 24, SI: 19,
    ES: 24, SE: 24, CH: 21, TN: 24, TR: 26, AE: 23, GB: 22, VG: 24
  };

  if (normalized.length < 4) {
    return {
      success: true,
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: { 'Hata Nedeni': 'IBAN çok kısa (En az 4 karakter olmalıdır).' },
      notes: []
    };
  }

  const countryCode = normalized.substring(0, 2);
  const regexAlpha = /^[A-Z]{2}$/;
  if (!regexAlpha.test(countryCode)) {
    return {
      success: true,
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: {
        'Maskelenmiş IBAN': maskIban(normalized),
        'Hata Nedeni': 'İlk iki karakter geçerli bir ülke kodu (harf) olmalıdır.'
      },
      notes: []
    };
  }

  const expectedLength = IBAN_LENGTHS[countryCode];
  if (!expectedLength) {
    return {
      success: true,
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: {
        'Ülke Kodu': countryCode,
        'Maskelenmiş IBAN': maskIban(normalized),
        'Hata Nedeni': `${countryCode} ülke kodu sistemimiz tarafından desteklenmemektedir.`
      },
      notes: []
    };
  }

  if (normalized.length !== expectedLength) {
    return {
      success: true,
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: {
        'Ülke Kodu': countryCode,
        'Maskelenmiş IBAN': maskIban(normalized),
        'Hata Nedeni': `Uzunluk hatası. ${countryCode} IBAN uzunluğu ${expectedLength} karakter olmalıdır, ${normalized.length} karakter girildi.`
      },
      notes: []
    };
  }

  // MOD-97 Algoritması
  const rearranged = normalized.substring(4) + normalized.substring(0, 4);
  const numericString = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return (code - 55).toString();
    return char;
  }).join('');

  let isValid = false;
  try {
    isValid = BigInt(numericString) % BigInt(97) === BigInt(1);
  } catch (e) {
    isValid = false;
  }

  const notes = [
    'Önemli: IBAN\'ın matematiksel olarak geçerli olması, hesabın mevcut veya aktif olduğu anlamına gelmez. Bu araç sadece biçimsel ve algoritmik doğrulama yapar.',
    'Referans Standart: Uluslararası geçerliliğe sahip ISO 13616 ve SWIFT IBAN Registry baz alınarak MOD-97-10 algoritması ile hesaplanmıştır.'
  ];

  if (isValid) {
    let structuralInfo = '';
    if (countryCode === 'TR') {
      structuralInfo = 'TR (Ülke) + 2 Kontrol Hanesi + 5 Banka Kodu + Rezerv/Hesap Numarası';
    }

    const secRes: any = {
      'Doğrulama Sonucu': 'Geçerli',
      'Ülke': countryCode,
      'IBAN Uzunluğu': expectedLength.toString() + ' Karakter',
      'MOD-97 Algoritması': 'Başarılı',
      'Maskelenmiş IBAN': maskIban(normalized)
    };
    if (structuralInfo) secRes['Yapısal Çözümleme'] = structuralInfo;

    return {
      success: true,
      primaryResult: 'IBAN Geçerli',
      secondaryResults: secRes,
      notes
    };
  } else {
    return {
      success: true,
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: {
        'Doğrulama Sonucu': 'Başarısız',
        'Ülke': countryCode,
        'MOD-97 Algoritması': 'Hatalı (Checksum eşleşmiyor)',
        'Maskelenmiş IBAN': maskIban(normalized),
        'Hata Nedeni': 'IBAN içeriğindeki kontrol basamakları matematiksel olarak geçersiz.'
      },
      notes
    };
  }
}
