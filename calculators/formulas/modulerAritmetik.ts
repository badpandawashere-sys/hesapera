export function calculateModulerAritmetik(input: { a: number; b: number; m: number; islem: 'mod' | 'toplama' | 'cikarma' | 'carpma' }) {
  const { a, b, m, islem } = input;

  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(m)) {
    throw new Error("Lütfen sadece tam sayı giriniz.");
  }
  if (m <= 0) {
    throw new Error("Mod (m) değeri 0'dan büyük olmalıdır.");
  }

  // Helper for safe true mathematical modulo (always positive)
  const modulo = (val: number, mod: number) => {
    // For large safe integers, BigInt avoids JS precision issues on extreme multiply
    const v = BigInt(val);
    const md = BigInt(mod);
    const result = ((v % md) + md) % md;
    return Number(result);
  };

  let sonuc: number;
  let islemLabel: string;
  let islemAciklama: string;

  if (islem === 'mod') {
    sonuc = modulo(a, m);
    islemLabel = `${a} ≡ ${sonuc} (mod ${m})`;
    islemAciklama = `${a} mod ${m}`;
  } else if (islem === 'toplama') {
    sonuc = modulo(a + b, m);
    islemLabel = `(${a} + ${b}) ≡ ${sonuc} (mod ${m})`;
    islemAciklama = `(${a} + ${b}) mod ${m}`;
  } else if (islem === 'cikarma') {
    sonuc = modulo(a - b, m);
    islemLabel = `(${a} - ${b}) ≡ ${sonuc} (mod ${m})`;
    islemAciklama = `(${a} - ${b}) mod ${m}`;
  } else {
    // carpma
    // using BigInt directly to avoid precision loss on a*b
    const v = (BigInt(a) * BigInt(b));
    const md = BigInt(m);
    sonuc = Number(((v % md) + md) % md);
    islemLabel = `(${a} × ${b}) ≡ ${sonuc} (mod ${m})`;
    islemAciklama = `(${a} × ${b}) mod ${m}`;
  }

  return {
    primaryResult: sonuc.toString(),
    secondaryResults: {
      'İşlem Özeti': islemAciklama,
      'Denklik': islemLabel,
      'Mod (m)': String(m)
    },
    notes: [
      'Not: Modüler aritmetikte sonuç her zaman 0 ile (m-1) arasında pozitif bir tam sayıdır.'
    ]
  };
}
