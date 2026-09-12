export interface EbobEkokInput {
  a: number;
  b: number;
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

export function calculateEbobEkok(inputs: EbobEkokInput) {
  const { a, b } = inputs;

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("Lütfen tam sayı giriniz.");
  }
  if (a < 1 || b < 1) {
    throw new Error("Lütfen 1 veya daha büyük pozitif tam sayı giriniz.");
  }

  const ebob = gcd(a, b);
  const ekok = (a / ebob) * b; // = |a*b| / gcd(a,b) — safe for JS integers

  return {
    primaryResult: `EBOB: ${ebob} | EKOK: ${ekok}`,
    secondaryResults: {
      "EBOB (GCD)": String(ebob),
      "EKOK (LCM)": String(ekok)
    },
    notes: [
      `EBOB (En Büyük Ortak Bölen): ${a} ve ${b} sayılarını tam bölen en büyük pozitif tam sayıdır.`,
      `EKOK (En Küçük Ortak Kat): ${a} ve ${b} sayılarının her ikisine de tam bölünen en küçük pozitif tam sayıdır.`,
      "Formül: EKOK(a,b) = |a×b| / EBOB(a,b)"
    ]
  };
}
