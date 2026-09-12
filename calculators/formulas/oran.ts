import { gcd } from './ebobEkok';

export function calculateOran(input: { a: number; b: number }) {
  const { a, b } = input;

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error("Lütfen tam sayı giriniz.");
  }
  if (a <= 0 || b <= 0) {
    throw new Error("A ve B değerleri 0'dan büyük pozitif tam sayı olmalıdır.");
  }

  const ortakBolen = gcd(a, b);
  const sadeA = a / ortakBolen;
  const sadeB = b / ortakBolen;

  const ondalik = a / b;
  const formattedOndalik = Number.isInteger(ondalik) ? ondalik.toString() : ondalik.toFixed(4).replace(/\.?0+$/, '');

  return {
    primaryResult: `${sadeA}:${sadeB}`,
    secondaryResults: {
      'Girilen Oran': `${a}:${b}`,
      'Sadeleştirilmiş Oran': `${sadeA}:${sadeB}`,
      'Ondalık Değer (A/B)': formattedOndalik,
      'Ortak Bölen (EBOB)': String(ortakBolen)
    }
  };
}
