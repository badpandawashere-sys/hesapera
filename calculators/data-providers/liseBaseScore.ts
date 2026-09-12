// Lise / LGS Taban Puanları Data Provider
// Gerçek veri kaynağı: MEB e-Okul / ÖSYM LGS Yerleştirme Sonuçları
// Bu dosya mock veri içermektedir. isMock: true olan kayıtlar demo amaçlıdır.
export interface LiseBaseScore {
  year: number;
  school: string;
  city: string;
  district: string;
  schoolType: "Anadolu Lisesi" | "Fen Lisesi" | "Mesleki-Teknik" | "Sosyal Bilimler Lisesi" | "Güzel Sanatlar Lisesi" | "İmam Hatip Lisesi" | "Genel Lise";
  baseScore: number;
  percentile?: number;
  quota: number;
  isMock: true;
  source: string;
  fetchedAt: string;
}

export interface LiseBaseScoreFilters {
  year?: number;
  city?: string;
  district?: string;
  school?: string;
  schoolType?: string;
  minScore?: number;
  maxScore?: number;
}

export interface LiseBaseScoreProvider {
  getBaseScores(filters: LiseBaseScoreFilters): Promise<LiseBaseScore[]>;
  getAvailableYears(): number[];
  getAvailableCities(): string[];
}

const MOCK_DATA: LiseBaseScore[] = [
  { year: 2025, school: "Ankara Fen Lisesi", city: "Ankara", district: "Çankaya", schoolType: "Fen Lisesi", baseScore: 498.50, percentile: 0.10, quota: 60, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "Galatasaray Lisesi", city: "İstanbul", district: "Beyoğlu", schoolType: "Anadolu Lisesi", baseScore: 497.80, percentile: 0.15, quota: 50, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "İzmir Fen Lisesi", city: "İzmir", district: "Bornova", schoolType: "Fen Lisesi", baseScore: 495.20, percentile: 0.20, quota: 60, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "Bursa Anadolu Lisesi", city: "Bursa", district: "Osmangazi", schoolType: "Anadolu Lisesi", baseScore: 460.30, percentile: 2.50, quota: 120, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "Antalya Anadolu Lisesi", city: "Antalya", district: "Muratpaşa", schoolType: "Anadolu Lisesi", baseScore: 452.10, percentile: 3.20, quota: 120, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "Konya Meram Anadolu Lisesi", city: "Konya", district: "Meram", schoolType: "Anadolu Lisesi", baseScore: 445.80, percentile: 4.10, quota: 100, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "İstanbul Erkek Lisesi", city: "İstanbul", district: "Fatih", schoolType: "Anadolu Lisesi", baseScore: 480.90, percentile: 0.80, quota: 80, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2025, school: "Adana Anadolu Lisesi", city: "Adana", district: "Seyhan", schoolType: "Anadolu Lisesi", baseScore: 438.20, percentile: 5.50, quota: 120, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2024, school: "Ankara Fen Lisesi", city: "Ankara", district: "Çankaya", schoolType: "Fen Lisesi", baseScore: 496.40, percentile: 0.12, quota: 60, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2024, school: "Galatasaray Lisesi", city: "İstanbul", district: "Beyoğlu", schoolType: "Anadolu Lisesi", baseScore: 495.70, percentile: 0.18, quota: 50, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2024, school: "İzmir Fen Lisesi", city: "İzmir", district: "Bornova", schoolType: "Fen Lisesi", baseScore: 492.80, percentile: 0.22, quota: 60, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
  { year: 2024, school: "Bursa Anadolu Lisesi", city: "Bursa", district: "Osmangazi", schoolType: "Anadolu Lisesi", baseScore: 456.10, percentile: 2.80, quota: 120, isMock: true, source: "Demo / Mock Veri", fetchedAt: "2026-09-08" },
];

class MockLiseBaseScoreProvider implements LiseBaseScoreProvider {
  async getBaseScores(filters: LiseBaseScoreFilters): Promise<LiseBaseScore[]> {
    let results = [...MOCK_DATA];
    if (filters.year) results = results.filter(r => r.year === filters.year);
    if (filters.city) results = results.filter(r => r.city.toLowerCase().includes(filters.city!.toLowerCase()));
    if (filters.district) results = results.filter(r => r.district.toLowerCase().includes(filters.district!.toLowerCase()));
    if (filters.school) results = results.filter(r => r.school.toLowerCase().includes(filters.school!.toLowerCase()));
    if (filters.schoolType) results = results.filter(r => r.schoolType === filters.schoolType);
    if (filters.minScore !== undefined) results = results.filter(r => r.baseScore >= filters.minScore!);
    if (filters.maxScore !== undefined) results = results.filter(r => r.baseScore <= filters.maxScore!);
    return results.sort((a, b) => b.baseScore - a.baseScore);
  }
  getAvailableYears(): number[] { return [2025, 2024]; }
  getAvailableCities(): string[] { return ["Ankara", "İstanbul", "İzmir", "Bursa", "Antalya", "Konya", "Adana"]; }
}

export const liseBaseScoreProvider: LiseBaseScoreProvider = new MockLiseBaseScoreProvider();
