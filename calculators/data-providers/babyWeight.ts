// WHO Child Growth Standards - Weight-for-age (0-24 months) MEDIANS (50th percentile)
// Source: World Health Organization
// Effective From: 2006 (Current WHO Standard)
// https://www.who.int/tools/child-growth-standards/standards/weight-for-age

export interface WhoWeightEntry {
  month: number;
  boyMedian: number;
  girlMedian: number;
}

export const WHO_WEIGHT_MEDIANS: WhoWeightEntry[] = [
  { month: 0, boyMedian: 3.3, girlMedian: 3.2 },
  { month: 1, boyMedian: 4.5, girlMedian: 4.2 },
  { month: 2, boyMedian: 5.6, girlMedian: 5.1 },
  { month: 3, boyMedian: 6.4, girlMedian: 5.8 },
  { month: 4, boyMedian: 7.0, girlMedian: 6.4 },
  { month: 5, boyMedian: 7.5, girlMedian: 6.9 },
  { month: 6, boyMedian: 7.9, girlMedian: 7.3 },
  { month: 7, boyMedian: 8.3, girlMedian: 7.6 },
  { month: 8, boyMedian: 8.6, girlMedian: 7.9 },
  { month: 9, boyMedian: 8.9, girlMedian: 8.2 },
  { month: 10, boyMedian: 9.2, girlMedian: 8.5 },
  { month: 11, boyMedian: 9.4, girlMedian: 8.7 },
  { month: 12, boyMedian: 9.6, girlMedian: 8.9 },
  { month: 13, boyMedian: 9.9, girlMedian: 9.2 },
  { month: 14, boyMedian: 10.1, girlMedian: 9.4 },
  { month: 15, boyMedian: 10.3, girlMedian: 9.6 },
  { month: 16, boyMedian: 10.5, girlMedian: 9.8 },
  { month: 17, boyMedian: 10.7, girlMedian: 10.0 },
  { month: 18, boyMedian: 10.9, girlMedian: 10.2 },
  { month: 19, boyMedian: 11.1, girlMedian: 10.4 },
  { month: 20, boyMedian: 11.3, girlMedian: 10.6 },
  { month: 21, boyMedian: 11.5, girlMedian: 10.9 },
  { month: 22, boyMedian: 11.8, girlMedian: 11.1 },
  { month: 23, boyMedian: 12.0, girlMedian: 11.3 },
  { month: 24, boyMedian: 12.2, girlMedian: 11.5 }
];

export const isMock = false;

export function getWhoMedianWeight(month: number, gender: 'Erkek' | 'Kız'): number | null {
  const entry = WHO_WEIGHT_MEDIANS.find(e => e.month === month);
  if (!entry) return null;
  return gender === 'Erkek' ? entry.boyMedian : entry.girlMedian;
}
