/**
 * Pure formula function for percentage calculation.
 * 
 * @param baseValue The base number
 * @param percentage The percentage to calculate (e.g. 20 for 20%)
 * @returns The calculated percentage value
 */
export function calculatePercentage(baseValue: number, percentage: number): number {
  return (baseValue * percentage) / 100;
}
