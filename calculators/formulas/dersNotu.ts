// Ders Notu Hesaplama (Egitim Formulu)
// Basit veya Agirlikli Ortalama

export interface DersNotuItem {
  not: number;
  agirlik?: number;
}

export function calculateDersNotu(notlar: DersNotuItem[], isAgirlikli: boolean) {
  if (!notlar || notlar.length === 0) {
    throw new Error("Lutfen en az bir not girin.");
  }

  let totalNot = 0;
  let totalAgirlik = 0;

  for (const n of notlar) {
    if (n.not < 0 || n.not > 100) {
      throw new Error("Notlar 0 ile 100 arasinda olmalidir.");
    }
    const agirlik = isAgirlikli ? (n.agirlik !== undefined ? n.agirlik : 1) : 1;
    if (agirlik < 0) {
      throw new Error("Agirlik negatif olamaz.");
    }
    
    totalNot += n.not * agirlik;
    totalAgirlik += agirlik;
  }

  if (totalAgirlik === 0) {
    throw new Error("Toplam agirlik sifir olamaz.");
  }

  const ortalama = totalNot / totalAgirlik;

  let durum = "Belirsiz";
  if (ortalama >= 50) durum = "Gecti (Genel 50 siniri baz alinarak)";
  else durum = "Kaldi (Genel 50 siniri baz alinarak)";

  return {
    primaryResult: ortalama.toFixed(2),
    secondaryResults: {
      "Toplam Not Sayısı": notlar.length.toString(),
      "Hesaplama Türü": isAgirlikli ? "Ağırlıklı Ortalama" : "Basit Ortalama",
      "Genel Başarı Durumu": durum
    },
    notes: [
      "Girilen notların ortalaması hesaplanmıştır.",
      "Gecme notu egitim kurumunuza (ilkokul, ortaokul, lise, universite) ve yasal yonetmeliklere gore farklilik gosterebilir. Ornek: Lisede ders gecme notu genellikle 50'dir.",
      isAgirlikli ? "Notlar ağırlıklarıyla çarpılarak ağırlıklı ortalama elde edilmiştir." : "Tüm notlar eşit ağırlıkta kabul edilmiştir."
    ]
  };
}
