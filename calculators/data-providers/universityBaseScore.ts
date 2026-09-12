export interface UniversityBaseScore {
  year: number;
  university: string;
  program: string;
  city: string;
  scoreType: string;
  baseScore: number;
  maxScore?: number;
  quota: number;
  placed: number;
  ranking?: number;
  isMock: boolean;
  source: string;
  fetchedAt: string;
}

export interface UniversityBaseScoreFilters {
  year?: number;
  university?: string;
  program?: string;
  city?: string;
  scoreType?: string;
  minScore?: number;
  maxScore?: number;
}

const mockData: UniversityBaseScore[] = [
  {
    year: 2026,
    university: 'Hacettepe Universitesi',
    program: 'Tip (Ingilizce)',
    city: 'Ankara',
    scoreType: 'SAY',
    baseScore: 535.40,
    maxScore: 560.12,
    quota: 150,
    placed: 150,
    ranking: 1200,
    isMock: true,
    source: 'Demo / Mock Veri (OSYM Taslak Tablolari)',
    fetchedAt: new Date().toISOString()
  },
  {
    year: 2026,
    university: 'Bogazici Universitesi',
    program: 'Bilgisayar Muhendisligi (Ingilizce)',
    city: 'Istanbul',
    scoreType: 'SAY',
    baseScore: 540.20,
    maxScore: 558.00,
    quota: 80,
    placed: 80,
    ranking: 850,
    isMock: true,
    source: 'Demo / Mock Veri (OSYM Taslak Tablolari)',
    fetchedAt: new Date().toISOString()
  },
  {
    year: 2026,
    university: 'Orta Dogu Teknik Universitesi',
    program: 'Isletme (Ingilizce)',
    city: 'Ankara',
    scoreType: 'EA',
    baseScore: 490.15,
    maxScore: 512.45,
    quota: 120,
    placed: 120,
    ranking: 3400,
    isMock: true,
    source: 'Demo / Mock Veri (OSYM Taslak Tablolari)',
    fetchedAt: new Date().toISOString()
  },
  {
    year: 2026,
    university: 'Ankara Universitesi',
    program: 'Hukuk',
    city: 'Ankara',
    scoreType: 'EA',
    baseScore: 450.30,
    maxScore: 495.00,
    quota: 500,
    placed: 500,
    ranking: 8000,
    isMock: true,
    source: 'Demo / Mock Veri (OSYM Taslak Tablolari)',
    fetchedAt: new Date().toISOString()
  },
  {
    year: 2026,
    university: 'Galatasaray Universitesi',
    program: 'Hukuk',
    city: 'Istanbul',
    scoreType: 'EA',
    baseScore: 520.10,
    maxScore: 540.80,
    quota: 50,
    placed: 50,
    ranking: 400,
    isMock: true,
    source: 'Demo / Mock Veri (OSYM Taslak Tablolari)',
    fetchedAt: new Date().toISOString()
  }
];

export async function queryUniversityBaseScores(filters: UniversityBaseScoreFilters): Promise<UniversityBaseScore[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return mockData.filter(item => {
    if (filters.year && item.year !== filters.year) return false;
    if (filters.university && !item.university.toLowerCase().includes(filters.university.toLowerCase())) return false;
    if (filters.program && !item.program.toLowerCase().includes(filters.program.toLowerCase())) return false;
    if (filters.city && !item.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
    if (filters.scoreType && item.scoreType !== filters.scoreType) return false;
    if (filters.minScore !== undefined && item.baseScore < filters.minScore) return false;
    if (filters.maxScore !== undefined && item.baseScore > filters.maxScore) return false;
    return true;
  });
}
