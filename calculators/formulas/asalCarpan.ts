export interface AsalCarpanInput {
  sayi: number;
}

export function calculateAsalCarpan(inputs: AsalCarpanInput) {
  const { sayi } = inputs;

  if (!Number.isInteger(sayi)) {
    throw new Error("Lütfen bir tam sayı giriniz.");
  }
  
  if (sayi < 2) {
    if (sayi === 1) {
      return {
        primaryResult: "Ayrıştırılamaz",
        secondaryResults: {
          "Sonuç": "1 asal çarpana ayrıştırılamaz."
        },
        notes: ["1 sayısı asal sayı değildir ve çarpanlarına ayrılamaz."]
      };
    }
    throw new Error("Lütfen 2 veya daha büyük bir tam sayı giriniz.");
  }

  // Prime factorization
  let n = sayi;
  const factors: Record<number, number> = {};
  
  // Divide by 2
  while (n % 2 === 0) {
    factors[2] = (factors[2] || 0) + 1;
    n = n / 2;
  }
  
  // Divide by odd numbers
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    while (n % i === 0) {
      factors[i] = (factors[i] || 0) + 1;
      n = n / i;
    }
  }
  
  // If n is a prime greater than 2
  if (n > 2) {
    factors[n] = (factors[n] || 0) + 1;
  }

  const bases = Object.keys(factors).map(Number).sort((a, b) => a - b);
  
  let formattedResult = '';
  let listResult = '';
  
  bases.forEach((base, index) => {
    const exponent = factors[base];
    const isLast = index === bases.length - 1;
    
    let powStr = exponent === 1 ? '' : `^${exponent}`;
    
    // For standard string presentation
    formattedResult += `${base}${powStr}${isLast ? '' : ' × '}`;
    
    // For list presentation
    listResult += `${base}${exponent > 1 ? ` (${exponent} adet)` : ''}${isLast ? '' : ', '}`;
  });

  const isPrime = bases.length === 1 && factors[bases[0]] === 1;

  return {
    primaryResult: formattedResult,
    secondaryResults: {
      "Asal Çarpanlar": listResult,
      "Sayı Türü": isPrime ? "Asal Sayı" : "Bileşik Sayı"
    },
    notes: [
      isPrime ? "Girdiğiniz sayı kendisinden ve 1'den başka tam böleni olmayan bir asal sayıdır." : "Girdiğiniz sayı birden fazla asal çarpanı olan bir bileşik sayıdır."
    ]
  };
}
