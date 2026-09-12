import { getUniversityBaseScores } from '../universityBaseScores';
import { describe, it, expect } from 'vitest';

describe('University Base Scores Formula Wrapper', () => {
  it('should return all mock data without filters', async () => {
    const results = await getUniversityBaseScores({});
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].isMock).toBe(true);
  });

  it('should filter by scoreType', async () => {
    const results = await getUniversityBaseScores({ scoreType: 'SAY' });
    expect(results.length).toBe(2);
    expect(results[0].university).toBe('Hacettepe Universitesi');
  });

  it('should filter by university', async () => {
    const results = await getUniversityBaseScores({ university: 'Hacettepe' });
    expect(results.length).toBe(1);
  });
});
