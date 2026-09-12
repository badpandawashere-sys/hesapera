// Lise / LGS Taban Puanları sorgu yardımcısı
// Gerçek LGS taban puanı verisi MEB e-Okul ve ÖSYM LGS yerleştirme
// sonuçlarından elde edilir. Bu fonksiyon mock provider kullanmaktadır.
import { liseBaseScoreProvider, LiseBaseScoreFilters, LiseBaseScore } from "../data-providers/liseBaseScore";

export async function queryLiseBaseScores(
  filters: LiseBaseScoreFilters
): Promise<LiseBaseScore[]> {
  return liseBaseScoreProvider.getBaseScores(filters);
}

export function getAvailableYears(): number[] {
  return liseBaseScoreProvider.getAvailableYears();
}

export function getAvailableCities(): string[] {
  return liseBaseScoreProvider.getAvailableCities();
}
