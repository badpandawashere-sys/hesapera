import { VACCINE_SCHEDULE_2026 } from '../data-providers/vaccineSchedule';

export interface AsiTakvimiInput {
  dogumTarihi: string; // YYYY-MM-DD
  referansTarihi?: string; // YYYY-MM-DD, opsiyonel, deterministik testler icin
}

export function calculateAsiTakvimi(inputs: AsiTakvimiInput) {
  const dogum = new Date(inputs.dogumTarihi);
  const referans = inputs.referansTarihi ? new Date(inputs.referansTarihi) : new Date('2026-09-01'); // Safe fallback
  
  if (isNaN(dogum.getTime())) throw new Error("Geçersiz doğum tarihi.");
  if (isNaN(referans.getTime())) throw new Error("Geçersiz referans tarihi.");
  
  if (dogum > referans) {
    throw new Error("Doğum tarihi, işlem yapılan tarihten (veya referans tarihinden) sonra olamaz.");
  }

  // Yasa gore ay hesabi
  let ageInMonths = (referans.getFullYear() - dogum.getFullYear()) * 12 + (referans.getMonth() - dogum.getMonth());
  if (referans.getDate() < dogum.getDate()) {
    ageInMonths--;
  }

  if (ageInMonths < 0) ageInMonths = 0;

  // Aşı donemleri
  // 0, 1, 2, 4, 6, 12, 18, 24, 48
  const upcomingMilestones = [0, 1, 2, 4, 6, 12, 18, 24, 48].filter(m => m >= ageInMonths);
  const nextMilestone = upcomingMilestones.length > 0 ? upcomingMilestones[0] : null;

  let guncelAsilar = VACCINE_SCHEDULE_2026.filter(v => v.targetAgeMonths === ageInMonths);
  let yaklasanAsilar = nextMilestone !== null && nextMilestone !== ageInMonths
    ? VACCINE_SCHEDULE_2026.filter(v => v.targetAgeMonths === nextMilestone)
    : [];

  // Eger guncel asilar bossa, yaklasan asilara odaklaniyoruz.
  if (guncelAsilar.length === 0 && nextMilestone !== null) {
    guncelAsilar = yaklasanAsilar;
    yaklasanAsilar = upcomingMilestones.length > 1 
      ? VACCINE_SCHEDULE_2026.filter(v => v.targetAgeMonths === upcomingMilestones[1])
      : [];
  }

  const guncelTarih = new Date(dogum);
  if (nextMilestone !== null) {
    guncelTarih.setMonth(guncelTarih.getMonth() + (guncelAsilar.length > 0 ? guncelAsilar[0].targetAgeMonths : nextMilestone));
  }

  let sonuc = "";
  if (ageInMonths > 48) {
    sonuc = "Rutin Ulusal Çocukluk Aşıları Tamamlandı";
  } else if (guncelAsilar.length > 0) {
    sonuc = `${guncelAsilar[0].targetAgeMonths}. Ay Aşı Dönemi`;
  } else {
    sonuc = "Bekleyen Rutin Aşı Yok";
  }

  return {
    primaryResult: sonuc,
    secondaryResults: {
      "Bebeğin Ayı": `${ageInMonths} Aylık`,
      "Şu Anki / Yaklaşan Aşılar": guncelAsilar.length > 0 ? guncelAsilar.map(a => a.vaccineName).join(', ') : 'Yok',
      "Sonraki Dönem": yaklasanAsilar.length > 0 ? `${yaklasanAsilar[0].targetAgeMonths}. Ay` : 'Yok'
    },
    notes: [
      "Kaynak: T.C. Sağlık Bakanlığı, 1 Eylül 2026 tarihli güncel Ulusal Çocukluk Dönemi Aşılama Takvimi.",
      "ÖNEMLİ BİLGİ: 48. aya (ilköğretim 1. sınıf çağı) Suçiçeği 2. dozu eklenmiştir.",
      "Eksik veya gecikmiş aşı durumunda yakalama (catch-up) takvimi kesinlikle sağlık personeli/aile hekiminiz tarafından kişiye özel belirlenmelidir.",
      "Bu araç kesin tıbbi tavsiye vermez, resmi takvime dayalı genel takip içindir."
    ]
  };
}
