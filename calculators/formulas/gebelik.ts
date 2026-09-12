export interface GebelikInput {
  sonAdetTarihi: string;
  referansTarihi?: string;
}

export function calculateGebelik(inputs: GebelikInput) {
  const lmp = new Date(inputs.sonAdetTarihi);
  const referans = inputs.referansTarihi ? new Date(inputs.referansTarihi) : new Date();

  if (isNaN(lmp.getTime())) throw new Error("Geçersiz Son Adet Tarihi.");
  if (isNaN(referans.getTime())) throw new Error("Geçersiz Referans Tarihi.");

  if (lmp > referans) throw new Error("Son adet tarihi referans tarihinden (bugün) ileride olamaz.");

  const diffTime = referans.getTime() - lmp.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 300) throw new Error("Hesaplama sınırları aşıldı (42 haftadan fazla).");

  const hafta = Math.floor(diffDays / 7);
  const gun = diffDays % 7;

  // Trimester sinirlari (genel tibbi kullanim)
  // 1. Trimester: 0 - 13 hafta
  // 2. Trimester: 14 - 27 hafta
  // 3. Trimester: 28 - 40 hafta
  let trimester = "";
  if (hafta <= 13) trimester = "1. Trimester";
  else if (hafta <= 27) trimester = "2. Trimester";
  else trimester = "3. Trimester";

  // Tahmini dogum tarihi: LMP + 280 gun (40 hafta)
  const edd = new Date(lmp.getTime());
  edd.setDate(edd.getDate() + 280);

  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  return {
    primaryResult: `${hafta} Hafta ${gun} Gün`,
    secondaryResults: {
      "İçinde Bulunulan Dönem": trimester,
      "Tahmini Doğum Tarihi": formatDate(edd),
      "Gebelik Süresi (Gün)": `${diffDays} Gün`
    },
    notes: [
      "Bu hesaplama gebelik yaşının tahmini olarak belirlenmesinde kullanılan 280 günlük (40 hafta) klinik standart formüle dayanır.",
      "Hesaplanan 'Tahmini Doğum Tarihi' mutlak bir gün değildir; çoğu doğum bu tarihten önceki veya sonraki birkaç haftalık aralıkta gerçekleşir.",
      "Bu hesaplayıcı ultrason ölçümünün, fetal gelişim muayenesinin veya hekim teşhisinin yerini tutmaz. Gebeliğinizle ilgili kesin haftayı, sağlığını ve gerçek doğum sürecini mutlaka doktorunuzla (Kadın Hastalıkları ve Doğum Uzmanı) takip ediniz."
    ]
  };
}
