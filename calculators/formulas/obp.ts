// OBP — Ortaogretim Basari Puani
// Kaynak: OSYM 2026-YKS Kilavuzu (osym.gov.tr)
//
// Resmi formul (2026-YKS):
//   OBP = Diploma Notu x 5  (diploma notu 0-100 -> OBP 0-500)
//
// YKS yerlestirme puanina katki:
//   Normal OBP katkisi    : OBP x 0.12  (maks 60 puan)
//   Kirik OBP katkisi     : OBP x 0.06  (maks 30 puan)
//
// NOT: Kirik OBP (katsayinin yariya dusurulmesi), bir onceki yil
// YKS puaniyla merkezi yerlestirme veya ozel yetenek sinaviyla
// bir yuksekogretim programina yerlestirilmis adaylara uygulanir.
// (Alan uyumsuzlugu ile ilgili degildir, alan uyumsuzlugu eski bir kuraldir.)

export interface ObpResult {
  diplomaNotu: number;
  obp: number;
  normalContribution: number;
  kirikcContribution: number;
}

export function calculateObp(diplomaNotu: number): ObpResult {
  if (diplomaNotu < 0 || diplomaNotu > 100) {
    throw new Error("Diploma notu 0-100 araliginda olmalidir.");
  }
  const obp = diplomaNotu * 5;
  const normalContribution = parseFloat((obp * 0.12).toFixed(3));
  const kirikcContribution = parseFloat((obp * 0.06).toFixed(3));
  return { diplomaNotu, obp, normalContribution, kirikcContribution };
}

export function formatObpResult(result: ObpResult, useKirik: boolean) {
  return {
    primaryResult: result.obp.toFixed(0),
    secondaryResults: {
      "Diploma Notu": result.diplomaNotu.toFixed(2) + " / 100",
      "OBP (Ortaogretim Basari Puani)": result.obp.toFixed(0) + " / 500",
      "Normal OBP Katkisi (x0.12)": result.normalContribution.toFixed(3),
      "Kirik OBP Katkisi (x0.06)": result.kirikcContribution.toFixed(3),
      "Aktif Katki Turu": useKirik ? "Kirik OBP (Onceki Yil Yerlesme)" : "Normal OBP"
    },
    notes: [
      "OBP = Diploma Notu x 5 formulu ile hesaplanir (maks 500). Kaynak: OSYM 2026-YKS Kilavuzu.",
      "YKS yerlestirme puanina normal katki: OBP x 0.12 (maks 60 puan). Kirik OBP katkisi: OBP x 0.06 (maks 30 puan).",
      "Kirik OBP; bir onceki yil YKS ile (acikogretim kontenjansiz programlari haric) bir yuksekogretim programina yerlestirilen adaylara uygulanir."
    ]
  };
}
