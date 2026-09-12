export function calculatePermutation(n: number, r: number) {
  let result = 1;
  for (let i = n; i > n - r; i--) {
    result *= i;
  }
  
  return {
    primaryResult: result,
    secondaryResults: {
      'Toplam Eleman (n)': n,
      'Seçim Sayısı (r)': r,
      'İşlem': 'P(' + n + ', ' + r + ')'
    }
  };
}