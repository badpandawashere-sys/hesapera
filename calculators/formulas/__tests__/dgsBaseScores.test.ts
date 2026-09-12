import { queryDgsBaseScores } from '../dgsBaseScores';
import { describe, it, expect } from 'vitest';

describe('DGS Base Scores Provider', () => {
  it('should return all mock data with no filters', async () => {
    const result = await queryDgsBaseScores({});
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.isMock).toBe(true);
  });

  it('should filter by city', async () => {
    const result = await queryDgsBaseScores({ city: 'Ankara' });
    expect(result.results.every(r => r.city.includes('Ankara'))).toBe(true);
  });

  it('should filter by year', async () => {
    const result = await queryDgsBaseScores({ year: 2023 });
    expect(result.results.every(r => r.year === 2023)).toBe(true);
  });
});