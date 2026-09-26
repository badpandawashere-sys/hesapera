import { render, screen, act } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { MaasForm } from '../maas-form';
import { maasCalculatorDef } from '@/calculators/definitions/maas';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      primaryResult: {
        months: [
          { month: 1, monthName: 'Ocak', netSalary: 40207.53, grossSalary: 50000, sgkEmployee: 7000, unemploymentEmployee: 500, incomeTax: 2163.67, stampTax: 128.8, cumulativeTaxBase: 42500 }
        ],
        annualGross: 600000,
        annualNet: 482490.36,
        annualTaxesAndPremiums: 117509.64,
        monthlyEmployerCost: 60000,
        annualEmployerCost: 720000
      }
    }
  })
}));

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>
}));

test('MaasForm Component renders correctly', async () => {
  await act(async () => {
    render(<MaasForm calculator={maasCalculatorDef as any} />);
  });

  expect(screen.getByText('Maaş Hesaplama')).toBeDefined();
  expect(screen.getByText('Aylık Brüt Maaş (TL)')).toBeDefined();
});
