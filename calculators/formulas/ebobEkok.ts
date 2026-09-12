export interface EbobEkokInput {
  numbers: Array<{ value: number }>;
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

export function calculateEbobEkok(inputs: EbobEkokInput) {
  const numbers = inputs.numbers.map(n => n.value);

  if (numbers.length < 2) {
    throw new Error("Lütfen en az 2 adet sayı giriniz.");
  }

  for (const num of numbers) {
    if (typeof num !== 'number' || !Number.isInteger(num)) {
      throw new Error("Lütfen sadece tam sayı giriniz.");
    }
    if (num < 1) {
      throw new Error("Lütfen 1 veya daha büyük pozitif tam sayılar giriniz.");
    }
  }

  const ebobResult = numbers.reduce((acc, curr) => gcd(acc, curr));
  const ekokResult = numbers.reduce((acc, curr) => lcm(acc, curr));

  const numStrings = numbers.join(', ');

  return {
    primaryResult: `EBOB: ${ebobResult} | EKOK: ${ekokResult}`,
    secondaryResults: {
      "EBOB (GCD)": String(ebobResult),
      "EKOK (LCM)": String(ekokResult),
      "Girilen Sayılar": numStrings
    },
    notes: [
      `EBOB (En Büyük Ortak Bölen): ${numStrings} sayılarını tam bölen en büyük pozitif tam sayıdır.`,
      `EKOK (En Küçük Ortak Kat): ${numStrings} sayılarının hepsine tam bölünen en küçük pozitif tam sayıdır.`
    ]
  };
}
