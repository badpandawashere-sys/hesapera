export interface VucutYagOraniInput {
  cinsiyet: 'Erkek' | 'Kadın';
  boy: number;
  bel: number;
  boyun: number;
  kalca?: number; // Only required for women
}

export function calculateVucutYagOrani(inputs: VucutYagOraniInput) {
  const { cinsiyet, boy, bel, boyun, kalca } = inputs;

  if (boy < 100 || boy > 250) throw new Error("Geçerli bir boy (100-250 cm) giriniz.");
  if (bel < 40 || bel > 200) throw new Error("Geçerli bir bel çevresi (40-200 cm) giriniz.");
  if (boyun < 20 || boyun > 100) throw new Error("Geçerli bir boyun çevresi (20-100 cm) giriniz.");
  if (cinsiyet === 'Kadın' && (!kalca || kalca < 50 || kalca > 250)) {
    throw new Error("Kadınlar için geçerli bir kalça çevresi (50-250 cm) girmelisiniz.");
  }

  // U.S. Navy Method (Hodgdon & Beckett) using log10
  let yagYuzdesi = 0;
  
  if (cinsiyet === 'Erkek') {
    if (bel <= boyun) {
      throw new Error("Bel çevresi, boyun çevresinden büyük olmalıdır.");
    }
    yagYuzdesi = 495 / (1.0324 - 0.19077 * Math.log10(bel - boyun) + 0.15456 * Math.log10(boy)) - 450;
  } else {
    // Kadın
    const kalcaDeger = kalca || 0;
    if (bel + kalcaDeger <= boyun) {
      throw new Error("Bel ve kalça toplamı, boyun çevresinden büyük olmalıdır.");
    }
    yagYuzdesi = 495 / (1.29579 - 0.35004 * Math.log10(bel + kalcaDeger - boyun) + 0.22100 * Math.log10(boy)) - 450;
  }

  if (yagYuzdesi < 2 || yagYuzdesi > 75) {
    throw new Error("Hesaplanan yağ oranı mantıksız bir aralıkta çıktı. Lütfen ölçümlerinizi kontrol ediniz.");
  }

  return {
    primaryResult: `%${yagYuzdesi.toFixed(1)}`,
    secondaryResults: {
      "Yöntem": "Amerikan Donanması (U.S. Navy) Metodu",
      "Kullanılan Formül": "Hodgdon ve Beckett (1984)"
    },
    notes: [
      "Bu hesaplama Amerikan Donanması (U.S. Navy Body Fat) ölçüm formülü kullanılarak yapılmıştır.",
      "Vücut çevre (mezura) ölçümlerine dayanan bu metot, Dexa veya Hidrostatik Tartım gibi bir klinik laboratuvar ölçümü DEĞİLDİR.",
      "Vücut hidrasyonunuz (su oranınız), ölçüm yaptığınız saat ve ölçüm tekniğinize göre hata payı (genellikle %3-5) barındırır.",
      "Bu değer kesin bir tıbbi değerlendirme olarak kullanılmamalıdır."
    ]
  };
}
