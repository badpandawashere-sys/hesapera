export function calculateIbanValidation(iban: string) {
  const normalized = iban.replace(/\s/g, '').toUpperCase();
  
  if (!normalized.startsWith('TR')) {
    return {
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: { 'Durum': 'Hatalı', 'Not': 'Türkiye IBAN numarası TR ile başlamalıdır.' }
    };
  }

  if (normalized.length !== 26) {
    return {
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: { 'Durum': 'Hatalı Uzunluk', 'Not': `Beklenen 26 karakter, Girilen ${normalized.length} karakter.` }
    };
  }

  // MOD 97 Check
  const rearranged = normalized.substring(4) + normalized.substring(0, 4);
  const numericString = rearranged.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) return (code - 55).toString(); // A=10, B=11
    return char;
  }).join('');

  let checksum = numericString.slice(0, 2);
  let fragment;
  for (let offset = 2; offset < numericString.length; offset += 7) {
    fragment = checksum + numericString.substring(offset, offset + 7);
    checksum = (parseInt(fragment, 10) % 97).toString();
  }
  
  const isValid = parseInt(checksum, 10) === 1;

  if (isValid) {
    return {
      primaryResult: 'Geçerli IBAN',
      secondaryResults: {
        'Ülke': 'TR',
        'Format': 'Doğru',
        'Kontrol Sonucu': 'Başarılı (MOD-97)'
      },
      notes: ['Bu araç IBAN numarasının matematiksel olarak geçerli olduğunu doğrular. IBAN\'ın bir hesaba ait olup olmadığını veya bankadaki durumunu kontrol edemez.']
    };
  } else {
    return {
      primaryResult: 'Geçersiz IBAN',
      secondaryResults: {
        'Ülke': 'TR',
        'Format': 'Hatalı',
        'Kontrol Sonucu': 'Başarısız (MOD-97 Checksum Hatası)'
      },
      notes: ['Girilen IBAN checksum algoritmasını geçemedi. Lütfen kontrol ediniz.']
    };
  }
}