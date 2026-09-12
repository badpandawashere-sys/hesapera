import { dgsBaseScoreProvider, DgsBaseScoreFilters } from '../data-providers/dgsBaseScore';

export async function queryDgsBaseScores(filters: DgsBaseScoreFilters, sortBy: 'score_asc' | 'score_desc' | 'university' = 'score_desc') {
  const results = await dgsBaseScoreProvider.getBaseScores(filters);
  
  if (sortBy === 'score_asc') results.sort((a, b) => a.baseScore - b.baseScore);
  else if (sortBy === 'score_desc') results.sort((a, b) => b.baseScore - a.baseScore);
  else results.sort((a, b) => a.university.localeCompare(b.university, 'tr'));
  
  return {
    results,
    count: results.length,
    isMock: true,
    note: 'Bu veriler Demo/Mock verilerdir. Gerçek DGS taban puanları için ÖSYM resmi sitesini ziyaret edin.'
  };
}