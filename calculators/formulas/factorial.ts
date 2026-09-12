export function calculateFactorial(n: number) {
  if (isNaN(n) || !isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error("Lütfen 0 veya daha büyük bir tam sayı giriniz.");
  }
  
  if (n > 2000) {
    throw new Error("Çok büyük değerler desteklenmemektedir.");
  }

  // Use BigInt internally to preserve precision for large values
  let result = BigInt(1);
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i);
  }

  // TR locale format for large numbers (dots for thousands)
  // NumberFormat natively supports BigInt
  const formatter = new Intl.NumberFormat('tr-TR');
  const resultStr = formatter.format(result);

  let breakdownIslem = "";
  if (n === 0) {
    breakdownIslem = "0! = 1";
  } else if (n <= 10) {
    const nums = [];
    for (let i = n; i >= 1; i--) nums.push(i);
    breakdownIslem = `${n}! = ${nums.join(' × ')}`;
  } else {
    breakdownIslem = `${n}! = ${n} × ${n - 1} × ... × 1`;
  }

  return {
    primaryLabel: 'Sonuç',
    primaryResult: resultStr,
    secondaryResults: {
      'Sayı (n)': n.toString(),
      'İşlem': `${n}!`,
      'Basamak Sayısı': result.toString().length.toString()
    },
    breakdown: [
      { label: 'İşlem Açılımı', value: breakdownIslem },
      { label: 'Sonuç', value: resultStr }
    ],
    infoReference: {
      title: 'Faktöriyel Nedir?',
      description: 'Faktöriyel (n!), 1\'den n\'e kadar olan tüm doğal sayıların çarpımıdır. Matematikte özel olarak 0! = 1 olarak tanımlanır.'
    }
  };
}
