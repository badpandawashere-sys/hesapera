export interface AdetGunuInput {
  sonAdetTarihi: string; // YYYY-MM-DD
  donguUzunlugu: number; // Gun cinsinden, varsayilan 28
}

export function calculateAdetGunu(inputs: AdetGunuInput) {
  const { sonAdetTarihi, donguUzunlugu } = inputs;
  
  const sonAdet = new Date(sonAdetTarihi);
  if (isNaN(sonAdet.getTime())) {
    throw new Error("Geçersiz son adet tarihi.");
  }
  
  if (donguUzunlugu < 20 || donguUzunlugu > 45) {
    throw new Error("Döngü uzunluğu genellikle 20-45 gün arasındadır. Lütfen geçerli bir ortalama giriniz.");
  }

  // Tahmini sonraki adet: son adet + dongu uzunlugu
  const tahminiSonrakiAdet = new Date(sonAdet.getTime());
  tahminiSonrakiAdet.setDate(tahminiSonrakiAdet.getDate() + donguUzunlugu);

  // Tahmini yumurtlama (ovulasyon) tarihi: adet kanamasindan ortalama 14 gun once
  const tahminiYumurtlama = new Date(tahminiSonrakiAdet.getTime());
  tahminiYumurtlama.setDate(tahminiYumurtlama.getDate() - 14);

  // Bir sonraki adet
  const ikinciAdet = new Date(tahminiSonrakiAdet.getTime());
  ikinciAdet.setDate(ikinciAdet.getDate() + donguUzunlugu);

  // Format YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return {
    primaryResult: formatDate(tahminiSonrakiAdet),
    secondaryResults: {
      "Tahmini Yumurtlama Günü": formatDate(tahminiYumurtlama),
      "Ondan Sonraki Beklenen Adet": formatDate(ikinciAdet)
    },
    notes: [
      "Sağlık Uyarısı: Şiddetli ağrı, olağandışı kanama, uzun süren gecikme veya gebelik şüphesi gibi durumlarda mutlaka bir sağlık profesyoneline (Kadın Hastalıkları ve Doğum Uzmanı) başvurunuz.",
      "Takvim hesabı, son adet tarihi ve ortalama döngü uzunluğu temel alınarak yapılan matematiksel bir tahmindir.",
      "Döngüsü düzensiz olan kadınlarda veya stres, diyet, hastalık gibi değişken durumlarında bu tarihler sapma gösterebilir.",
      "Bu hesaplayıcı tıbbi tanı veya kesin gebelik/korunma aracı değildir."
    ]
  };
}
