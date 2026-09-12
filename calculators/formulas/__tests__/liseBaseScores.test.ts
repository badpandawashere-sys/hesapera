import { queryLiseBaseScores, getAvailableYears, getAvailableCities } from '../liseBaseScores';
import { describe, it, expect } from 'vitest';

describe('Lise LGS Taban Puanlari Provider', () => {
  it('should return all mock data when no filters applied', async () => {
    const results = await queryLiseBaseScores({});
    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => expect(r.isMock).toBe(true));
  });

  it('should filter by year', async () => {
    const results = await queryLiseBaseScores({ year: 2025 });
    results.forEach(r => expect(r.year).toBe(2025));
  });

  it('should filter by city', async () => {
    const results = await queryLiseBaseScores({ city: 'Ankara' });
    results.forEach(r => expect(r.city).toContain('Ankara'));
  });

  it('should return available years', () => {
    const years = getAvailableYears();
    expect(years).toContain(2025);
    expect(years).toContain(2024);
  });

  it('should return available cities', () => {
    const cities = getAvailableCities();
    expect(cities.length).toBeGreaterThan(0);
  });
});
