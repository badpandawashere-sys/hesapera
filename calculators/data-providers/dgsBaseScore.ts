export interface DgsBaseScore {
  year: number;
  university: string;
  city: string;
  program: string;
  scoreType: 'SAY' | 'SOZ' | 'EA';
  baseScore: number;
  quota: number;
  rank?: number;
  isMock: true;
  source: string;
  fetchedAt: string;
}

export interface DgsBaseScoreFilters {
  year?: number;
  university?: string;
  city?: string;
  program?: string;
  scoreType?: string;
}

export interface DgsBaseScoreProvider {
  getBaseScores(filters: DgsBaseScoreFilters): Promise<DgsBaseScore[]>;
  getAvailableYears(): number[];
  getAvailableCities(): string[];
}

const MOCK_DGS_DATA: DgsBaseScore[] = [
  { year: 2024, university: 'Ankara Üniversitesi', city: 'Ankara', program: 'Bilgisayar Mühendisliği', scoreType: 'SAY', baseScore: 389.21, quota: 25, rank: 3800, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'İstanbul Üniversitesi', city: 'İstanbul', program: 'Hukuk', scoreType: 'SOZ', baseScore: 412.55, quota: 40, rank: 1200, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'ODTÜ', city: 'Ankara', program: 'Elektrik-Elektronik Mühendisliği', scoreType: 'SAY', baseScore: 421.80, quota: 20, rank: 800, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'Hacettepe Üniversitesi', city: 'Ankara', program: 'İşletme', scoreType: 'EA', baseScore: 350.12, quota: 30, rank: 5200, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'Ege Üniversitesi', city: 'İzmir', program: 'Bilgisayar Mühendisliği', scoreType: 'SAY', baseScore: 362.44, quota: 25, rank: 4900, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'İzmir Kâtip Çelebi Üniversitesi', city: 'İzmir', program: 'Hemşirelik', scoreType: 'SAY', baseScore: 310.08, quota: 50, rank: 8100, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'Uludağ Üniversitesi', city: 'Bursa', program: 'Muhasebe ve Vergi', scoreType: 'EA', baseScore: 298.76, quota: 40, rank: 10200, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2024, university: 'Selçuk Üniversitesi', city: 'Konya', program: 'Bilgisayar Programcılığı', scoreType: 'SAY', baseScore: 278.50, quota: 35, rank: 12500, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2023, university: 'Ankara Üniversitesi', city: 'Ankara', program: 'Bilgisayar Mühendisliği', scoreType: 'SAY', baseScore: 381.30, quota: 25, rank: 4100, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
  { year: 2023, university: 'İstanbul Üniversitesi', city: 'İstanbul', program: 'Hukuk', scoreType: 'SOZ', baseScore: 405.18, quota: 40, rank: 1400, isMock: true, source: 'Demo / Mock Veri', fetchedAt: '2026-09-08' },
];

export class MockDgsBaseScoreProvider implements DgsBaseScoreProvider {
  async getBaseScores(filters: DgsBaseScoreFilters): Promise<DgsBaseScore[]> {
    let results = [...MOCK_DGS_DATA];
    if (filters.year) results = results.filter(r => r.year === filters.year);
    if (filters.city) results = results.filter(r => r.city.toLowerCase().includes(filters.city!.toLowerCase()));
    if (filters.university) results = results.filter(r => r.university.toLowerCase().includes(filters.university!.toLowerCase()));
    if (filters.program) results = results.filter(r => r.program.toLowerCase().includes(filters.program!.toLowerCase()));
    if (filters.scoreType && filters.scoreType !== 'ALL') results = results.filter(r => r.scoreType === filters.scoreType);
    return results;
  }

  getAvailableYears(): number[] {
    return [2024, 2023];
  }

  getAvailableCities(): string[] {
    return ['Ankara', 'İstanbul', 'İzmir', 'Bursa', 'Konya'];
  }
}

export const dgsBaseScoreProvider = new MockDgsBaseScoreProvider();