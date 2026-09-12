export function calculateCombination(n: number, r: number) {
  if (!Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error("n ve r tam sayı olmalıdır.");
  }
  if (n < 0 || r < 0) {
    throw new Error("n ve r negatif olamaz.");
  }
  if (r > n) {
    throw new Error("r, n'den büyük olamaz.");
  }

  // Optimizasyon: C(n,r) = C(n, n-r) — smaller loop
  const k = r > n - r ? n - r : r;

  // BigInt to avoid precision loss for large combinations (e.g. C(52,5))
  let result = BigInt(1);
  for (let i = 0; i < k; i++) {
    result = result * BigInt(n - i) / BigInt(i + 1);
  }

  const resultStr = result.toString();

  return {
    primaryResult: resultStr,
    secondaryResults: {
      'Toplam Eleman (n)': String(n),
      'Seçim Sayısı (r)': String(r),
      'İşlem': `C(${n}, ${r})`
    },
    notes: [
      `Formül: C(n,r) = n! / (r! × (n-r)!)`,
      `C(${n},${r}) = ${resultStr} farklı seçim yolu mevcut.`
    ]
  };
}