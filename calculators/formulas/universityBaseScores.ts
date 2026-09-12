import { queryUniversityBaseScores, UniversityBaseScoreFilters, UniversityBaseScore } from '../data-providers/universityBaseScore';

export async function getUniversityBaseScores(filters: UniversityBaseScoreFilters): Promise<UniversityBaseScore[]> {
  return await queryUniversityBaseScores(filters);
}
