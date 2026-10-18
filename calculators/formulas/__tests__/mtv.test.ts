import { describe, expect, it } from 'vitest';
import { calculateMtv } from '../mtv';

const standard = {
  modelYear: 2023,
  firstRegistrationYear: 2023,
  vehicleType: 'combustion' as const,
  engineCc: 1600,
  vehicleValue: 500000,
};

describe('2026 binek otomobil MTV hesabı', () => {
  it('uses the 2018+ value tier and the model-year age band', () => {
    const result = calculateMtv(standard);

    expect(result.age).toBe(4);
    expect(result.ageBand).toBe('4–6 yaş');
    expect(result.annualTax).toBe(8264);
    expect(result.installment).toBe(4132);
    expect(result.tariff).toContain('I)');
  });

  it('selects tariff value tiers at the official 100 TL cutoffs', () => {
    const atBoundary = calculateMtv({ ...standard, engineCc: 1300, vehicleValue: 309199 });
    const aboveBoundary = calculateMtv({ ...standard, engineCc: 1300, vehicleValue: 309200 });

    expect(atBoundary.annualTax).toBe(4010);
    expect(aboveBoundary.annualTax).toBe(4409);
  });

  it('uses the I/A tariff for first registrations before 2018', () => {
    const result = calculateMtv({
      modelYear: 2016,
      firstRegistrationYear: 2016,
      vehicleType: 'combustion',
      engineCc: 3500,
      vehicleValue: 900000,
    });

    expect(result.age).toBe(11);
    expect(result.ageBand).toBe('7–11 yaş');
    expect(result.annualTax).toBe(48158);
    expect(result.tariff).toContain('I/A');
  });

  it('calculates a 1986 model first registered in 2000 with a 2000 cm³ engine', () => {
    const result = calculateMtv({
      modelYear: 1986,
      firstRegistrationYear: 2000,
      vehicleType: 'combustion',
      engineCc: 2000,
    });

    expect(result.age).toBe(41);
    expect(result.ageBand).toBe('16 yaş ve üzeri');
    expect(result.tariff).toContain('I/A');
    expect(result.annualTax).toBe(2958);
    expect(result.installment).toBe(1479);
  });

  it('applies the pre-2018 kasko threshold and previous engine-volume row', () => {
    const result = calculateMtv({
      modelYear: 2016,
      firstRegistrationYear: 2016,
      vehicleType: 'combustion',
      engineCc: 3500,
      vehicleValue: 600000,
      cascoValue: 600000,
    });

    expect(result.adjustedByCasco).toBe(true);
    expect(result.annualTax).toBe(31704);
  });

  it('applies the post-2018 kasko threshold and previous tariff row', () => {
    const result = calculateMtv({ ...standard, cascoValue: 50000 });

    expect(result.adjustedByCasco).toBe(true);
    expect(result.annualTax).toBe(7510);
  });

  it('taxes a fully electric car at 25 percent using its power band', () => {
    const result = calculateMtv({
      modelYear: 2024,
      firstRegistrationYear: 2024,
      vehicleType: 'electric',
      motorPowerKw: 85,
      vehicleValue: 500000,
    });

    expect(result.electricVehicle).toBe(true);
    expect(result.annualTax).toBe(2755);
    expect(result.installment).toBe(1377.5);
  });

  it('rejects inconsistent years and unsupported pre-2018 electric registrations', () => {
    expect(() => calculateMtv({ ...standard, modelYear: 2024, firstRegistrationYear: 2023 })).toThrow(/tescil yılı/);
    expect(() => calculateMtv({
      modelYear: 2016,
      firstRegistrationYear: 2017,
      vehicleType: 'electric',
      motorPowerKw: 85,
      vehicleValue: 300000,
    })).toThrow(/2018 ve sonrası/);
  });

  it('registers the published calculator in the automotive category', async () => {
    const { CalculatorRegistry } = await import('../../core/calculator-registry');
    const { initializeCalculators } = await import('../../core/init');
    initializeCalculators();

    const calculator = CalculatorRegistry.getBySlug('mtv-hesaplama');
    expect(calculator?.status).toBe('published');
    expect(calculator?.fields.find(({ id }) => id === 'modelYear')?.type).toBe('text');
    expect(CalculatorRegistry.getPublishedByCategory('otomotiv').map(({ slug }) => slug)).toContain('mtv-hesaplama');

    const { CalculatorEngine } = await import('../../core/calculator-engine');
    const currentResult = await CalculatorEngine.runBySlug('mtv-hesaplama', {
      ...standard,
      modelYear: '2023',
      firstRegistrationYear: '2023',
      cascoValue: '',
    });
    const olderResult = await CalculatorEngine.runBySlug('mtv-hesaplama', {
      modelYear: 2016,
      firstRegistrationYear: 2016,
      vehicleType: 'combustion',
      engineCc: 3500,
    });
    expect(currentResult.success).toBe(true);
    expect(currentResult.data?.primaryResult).toBe('8.264,00 TL');
    expect(olderResult.success).toBe(true);
    expect(olderResult.data?.primaryResult).toBe('48.158,00 TL');
  });
});
