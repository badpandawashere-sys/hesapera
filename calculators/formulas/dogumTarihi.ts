export interface DogumTarihiInput {
  hesaplamaYonu: 'YastanTarih' | 'TarihtenYas';
  dogumTarihi?: string;
  yil?: number;
  ay?: number;
  gun?: number;
  referansTarihi?: string;
}

export function calculateDogumTarihi(inputs: DogumTarihiInput) {
  const referans = inputs.referansTarihi ? new Date(inputs.referansTarihi) : new Date();

  if (isNaN(referans.getTime())) throw new Error("Geçersiz referans tarihi.");

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (inputs.hesaplamaYonu === 'TarihtenYas') {
    if (!inputs.dogumTarihi) throw new Error("Lütfen doğum tarihini giriniz.");
    const dogum = new Date(inputs.dogumTarihi);
    if (isNaN(dogum.getTime())) throw new Error("Geçersiz doğum tarihi.");
    if (dogum > referans) throw new Error("Doğum tarihi referans tarihinden (bugün) ileri olamaz.");

    let years = referans.getFullYear() - dogum.getFullYear();
    let months = referans.getMonth() - dogum.getMonth();
    let days = referans.getDate() - dogum.getDate();

    if (days < 0) {
      months--;
      const previousMonth = new Date(referans.getFullYear(), referans.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Toplam gun hesabi (leap year'lar dahildir)
    const diffTime = Math.abs(referans.getTime() - dogum.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      primaryResult: `${years} Yaşında`,
      secondaryResults: {
        "Detaylı Yaş": `${years} yıl, ${months} ay, ${days} gün`,
        "Toplam Gün": `${totalDays} gün`
      },
      notes: [
        "Yaş hesabı tam yıl/ay/gün takvim matematiğine (artık yıllar dahil) göre yapılmıştır."
      ]
    };
  } else {
    // Yastan Dogum Tarihi Bulma
    const yil = inputs.yil || 0;
    const ay = inputs.ay || 0;
    const gun = inputs.gun || 0;

    if (yil < 0 || ay < 0 || gun < 0) throw new Error("Yaş değerleri negatif olamaz.");

    const tahminiDogum = new Date(referans.getFullYear() - yil, referans.getMonth() - ay, referans.getDate() - gun);

    return {
      primaryResult: formatDate(tahminiDogum),
      secondaryResults: {
        "Girilen Yaş": `${yil} yıl, ${ay} ay, ${gun} gün`
      },
      notes: [
        "Seçilen tarihe (referans) göre geriye dönük takvim matematiğiyle yaklaşık doğum tarihi hesaplanmıştır.",
        "Aylardaki gün sayısı farklılıkları (28/30/31) nedeniyle gün bazında +/- 1-2 gün sapma olabilir."
      ]
    };
  }
}
