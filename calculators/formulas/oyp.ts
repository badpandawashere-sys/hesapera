// OYP — Ogretim Uyesi Yetistirme Programi (Tarihi Sistem)
// Kaynak: Yuksekogretim Kurulu (YOK) OYP Yonetmeligi (Resmi Gazete)
//
// ONEMLI: OYP merkezi yerlestirme sistemi yaklasik 2018 yilinda
// kaldirilmistir. Bu hesaplama tarihi OYP puan formulune dayanmaktadir.
// Guncel akademik atama/yerlestirme mevzuatiyla birebir uyusmuyor olabilir.
// Kaynak: YOK OYP Yonetmeligi ve ilgili duyurular.
//
// Tarihi OYP Formulu:
//   OYP Puani = ALES x 0.50 + Yabanci Dil (YDS/YOKDIL) x 0.10 + Lisans Notu x 0.40
//
// Not: Bazi varyantlarda bilim sinavi / mulakat eklenebiliyordu; ancak bu
// merkezi ilk elenme formulunde standart degildi.

export interface OypResult {
  alesScore: number;
  yabancıDilScore: number;
  lisansScore: number;
  oypScore: number;
}

export function calculateOyp(
  alesScore: number,
  yabancıDilScore: number,
  lisansScore: number
): OypResult {
  if (alesScore < 0 || alesScore > 100) throw new Error("ALES puani 0-100 araliginda olmalidir.");
  if (yabancıDilScore < 0 || yabancıDilScore > 100) throw new Error("Yabanci dil puani 0-100 araliginda olmalidir.");
  if (lisansScore < 0 || lisansScore > 100) throw new Error("Lisans mezuniyet notu 0-100 araliginda olmalidir.");

  const oypScore = parseFloat(
    (alesScore * 0.50 + yabancıDilScore * 0.10 + lisansScore * 0.40).toFixed(3)
  );

  return { alesScore, yabancıDilScore, lisansScore, oypScore };
}

export function formatOypResult(result: OypResult) {
  return {
    primaryResult: result.oypScore.toFixed(3),
    secondaryResults: {
      "ALES Katkisi (%50)": (result.alesScore * 0.50).toFixed(3),
      "Yabanci Dil Katkisi (%10)": (result.yabancıDilScore * 0.10).toFixed(3),
      "Lisans Notu Katkisi (%40)": (result.lisansScore * 0.40).toFixed(3),
      "Toplam OYP Puani": result.oypScore.toFixed(3)
    },
    notes: [
      "UYARI: OYP (Ogretim Uyesi Yetistirme Programi) merkezi yerlestirme sistemi yaklasik 2018 yilinda sona ermistir. Bu hesaplama tarihi OYP formulune dayanmakta olup guncel akademik atama/yerlestirme mevzuatiyla uyusmayabilir.",
      "Tarihi OYP formulu: ALES x 0.50 + Yabanci Dil x 0.10 + Lisans Mezuniyet Notu x 0.40. Kaynak: YOK OYP Yonetmeligi.",
      "Guncel akademik kadro aliniminda gecerli kurullar icin YOK ve ilgili universitenin resmi kanallarini inceleyin."
    ]
  };
}
