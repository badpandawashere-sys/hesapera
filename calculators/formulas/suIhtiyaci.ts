export interface SuIhtiyaciInput {
  kilo: number;
}

export function calculateSuIhtiyaci(inputs: SuIhtiyaciInput) {
  const { kilo } = inputs;

  if (kilo <= 20 || kilo > 300) throw new Error("Lütfen geçerli bir kilo (kg) giriniz.");

  // Geleneksel kural: kg basina ~35 ml
  // EFSA (Avrupa Gida Guvenligi Otoritesi) yetiskinler icin genel su (tum sivilar + gida) ihtiyacini 
  // kadinlarda ~2L, erkeklerde ~2.5L olarak belirtir.
  // Burada kg bazli spesifik "içilmesi gereken sivi" hesabi yapacagiz (35 ml/kg kurali klinik bir genel referanstir).
  const mlPerKg = 35;
  const totalMl = Math.round(kilo * mlPerKg);
  const totalLiters = (totalMl / 1000).toFixed(2);

  return {
    primaryResult: `${totalLiters} Litre / gün`,
    secondaryResults: {
      "Mililitre (ml) Cinsinden": `${totalMl} ml`,
      "Kullanılan Katsayı": `${mlPerKg} ml/kg`
    },
    notes: [
      "Bu hesaplama yaygın olarak kullanılan 'kilogram başına 35 ml' genel pratik kuralına dayanmaktadır. Bu kural, Avrupa Gıda Güvenliği Otoritesi (EFSA) standardı DEĞİLDİR.",
      "Avrupa Gıda Güvenliği Otoritesi (EFSA), yetişkinler için yiyeceklerden ve tüm içeceklerden (su, çay, meyve suyu vb.) alınan günlük toplam su (total water) ihtiyacını kadınlar için ortalama 2.0 L, erkekler için 2.5 L olarak belirtmektedir.",
      "Sıcak hava, fiziksel aktivite (terleme), hamilelik veya ateşli hastalık durumlarında su ihtiyacınız artabilir.",
      "Kalp veya böbrek yetmezliği gibi özel sıvı kısıtlaması gerektiren tıbbi durumlarınız varsa bu sonucu baz almayınız ve doktorunuza danışınız."
    ]
  };
}
