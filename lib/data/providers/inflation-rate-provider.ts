export interface InflationRateProvider {
  getRate(periodId: string): number | null;
  getRates(startPeriod: string, endPeriod: string): number[];
  getSource(): string;
  getLastUpdated(): string;
}