import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { MaasForm } from '../maas-form';
import { maasCalculatorDef } from '@/calculators/definitions/maas';
import { calculateAction } from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid="number-flow">{value}</span>
}));

const mockGrossToNetResponse = {
  success: true,
  data: {
    primaryResult: {
      calculationMode: 'grossToNet',
      months: [
        {
          month: 1,
          monthName: 'Ocak',
          grossSalary: 50000,
          sgkEmployee: 7000,
          unemploymentEmployee: 500,
          incomeTax: 2163.67,
          stampTax: 128.8,
          cumulativeTaxBase: 42500,
          netSalary: 40207.53,
          monthlyEmployerCost: 61500
        }
      ],
      annualGross: 600000,
      annualNet: 482490.36,
      annualTaxesAndPremiums: 117509.64,
      monthlyEmployerCost: 61500,
      annualEmployerCost: 738000,
      averageMonthlyGross: 50000,
      averageMonthlyNet: 40207.53,
      averageMonthlyEmployerCost: 61500
    }
  }
};

const mockNetToGrossResponse = {
  success: true,
  data: {
    primaryResult: {
      calculationMode: 'netToGross',
      months: [
        {
          month: 1,
          monthName: 'Ocak',
          grossSalary: 56703.60,
          sgkEmployee: 7938.50,
          unemploymentEmployee: 567.04,
          incomeTax: 3018.38,
          stampTax: 179.68,
          cumulativeTaxBase: 48198.06,
          netSalary: 45000.00,
          monthlyEmployerCost: 69745.43
        }
      ],
      annualGross: 720514.32,
      annualNet: 540000.00,
      annualTaxesAndPremiums: 180514.32,
      monthlyEmployerCost: 69745.43,
      annualEmployerCost: 886232.61,
      averageMonthlyGross: 60042.86,
      averageMonthlyNet: 45000.00,
      averageMonthlyEmployerCost: 73852.72
    }
  }
};

const mockManufacturingResponse = {
  success: true,
  data: {
    primaryResult: {
      calculationMode: 'grossToNet',
      months: [
        {
          month: 1,
          monthName: 'Ocak',
          grossSalary: 50000,
          sgkEmployee: 7000,
          unemploymentEmployee: 500,
          incomeTax: 2163.67,
          stampTax: 128.8,
          cumulativeTaxBase: 42500,
          netSalary: 40207.53,
          monthlyEmployerCost: 58375
        }
      ],
      annualGross: 600000,
      annualNet: 482490.36,
      annualTaxesAndPremiums: 117509.64,
      monthlyEmployerCost: 58375,
      annualEmployerCost: 700500,
      averageMonthlyGross: 50000,
      averageMonthlyNet: 40207.53,
      averageMonthlyEmployerCost: 58375
    }
  }
};

beforeEach(() => {
  vi.clearAllMocks();
  (calculateAction as any).mockResolvedValue(mockGrossToNetResponse);
});

test('MaasForm Component renders correctly with accessible tabs and inputs', async () => {
  await act(async () => {
    render(<MaasForm calculator={maasCalculatorDef as any} />);
  });

  expect(screen.getByText('Maaş Hesaplama')).toBeDefined();
  
  // Accessible tablist & tabs
  const tablist = screen.getByRole('tablist', { name: /Maaş hesaplama yönü/i });
  expect(tablist).toBeDefined();

  const grossTab = screen.getByRole('tab', { name: /Brütten Nete/i });
  const netTab = screen.getByRole('tab', { name: /Netten Brüte/i });
  expect(grossTab.getAttribute('aria-selected')).toBe('true');
  expect(netTab.getAttribute('aria-selected')).toBe('false');

  // Input htmlFor and id association
  const grossInput = screen.getByLabelText(/Aylık Brüt Maaş \(TL\)/i);
  expect(grossInput.getAttribute('id')).toBe('maas-gross-input');

  // Table contains both Kümülatif and İşv. Mal. columns after calculation resolves
  await waitFor(() => {
    expect(screen.getByText('Kümülatif')).toBeDefined();
    expect(screen.getByText('İşv. Mal.')).toBeDefined();
  });
});

test('MaasForm switches to Netten Brüte and updates accessible states', async () => {
  (calculateAction as any).mockResolvedValue(mockNetToGrossResponse);

  await act(async () => {
    render(<MaasForm calculator={maasCalculatorDef as any} />);
  });

  const netToGrossTab = screen.getByRole('tab', { name: /Netten Brüte/i });
  await act(async () => {
    fireEvent.click(netToGrossTab);
  });

  expect(netToGrossTab.getAttribute('aria-selected')).toBe('true');

  const netInput = screen.getByLabelText(/Aylık Hedef Net Maaş \(TL\)/i);
  expect(netInput.getAttribute('id')).toBe('maas-net-input');

  expect(screen.getByText('Sabit Net Maaş Modeli Nasıl Çalışır?')).toBeDefined();
  expect(screen.getByText('Sabit Net Maaş Modeli')).toBeDefined();
});

test('MaasForm clears results and shows explicit validation on empty or corrupt input', async () => {
  await act(async () => {
    render(<MaasForm calculator={maasCalculatorDef as any} />);
  });

  // Initially has results
  await waitFor(() => {
    expect(screen.getByText('40207.53')).toBeDefined();
  });

  const grossInput = screen.getByLabelText(/Aylık Brüt Maaş \(TL\)/i);

  // 1. Clear input (empty)
  await act(async () => {
    fireEvent.change(grossInput, { target: { value: '' } });
  });

  // Explicit validation message must be shown
  expect(screen.getAllByText('Lütfen bir brüt maaş tutarı girin.').length).toBeGreaterThan(0);
  // Stale calculation results must NOT be visible
  expect(screen.queryByText('40207.53')).toBeNull();
  expect(screen.getByText('Sonuçları ve 12 aylık bordro tablosunu görmek için geçerli bir tutar girin.')).toBeDefined();

  // 2. Corrupt/zero input
  await act(async () => {
    fireEvent.change(grossInput, { target: { value: '0' } });
  });

  expect(screen.getAllByText('Lütfen geçerli bir brüt maaş tutarı girin.').length).toBeGreaterThan(0);
  expect(screen.queryByText('40207.53')).toBeNull();

  // 3. Below minimum wage
  await act(async () => {
    fireEvent.change(grossInput, { target: { value: '25000' } });
  });

  expect(screen.getAllByText(/asgari ücret olan 33\.030 TL'den düşük olamaz/i).length).toBeGreaterThan(0);
  expect(screen.queryByText('40207.53')).toBeNull();
});

test('Strict regression: Delayed response during mode switch does NOT overwrite new mode results', async () => {
  let resolveCall1: (val: any) => void;
  const call1Promise = new Promise((resolve) => {
    resolveCall1 = resolve;
  });

  let resolveCall2: (val: any) => void;
  const call2Promise = new Promise((resolve) => {
    resolveCall2 = resolve;
  });

  // Call 1: Delayed grossToNet call
  // Call 2: Second call for netToGross
  (calculateAction as any)
    .mockImplementationOnce(() => call1Promise)
    .mockImplementationOnce(() => call2Promise);

  await act(async () => {
    render(<MaasForm calculator={maasCalculatorDef as any} />);
  });

  // Step 1: Wait for call 1 to start
  await waitFor(() => {
    expect(calculateAction).toHaveBeenCalledTimes(1);
    expect(calculateAction).toHaveBeenLastCalledWith(
      'maas',
      expect.objectContaining({ calculationMode: 'grossToNet', grossSalary: 50000 })
    );
  });

  // Step 2: Switch mode to netToGross while call 1 is still in flight
  const netTab = screen.getByRole('tab', { name: /Netten Brüte/i });
  await act(async () => {
    fireEvent.click(netTab);
  });

  // Step 3: Wait for call 2 to start after 300ms debounce
  await waitFor(() => {
    expect(calculateAction).toHaveBeenCalledTimes(2);
    expect(calculateAction).toHaveBeenLastCalledWith(
      'maas',
      expect.objectContaining({ calculationMode: 'netToGross', netSalary: 45000 })
    );
  });

  // Step 4: Resolve call 2 FIRST
  await act(async () => {
    resolveCall2!(mockNetToGrossResponse);
  });

  // Verify call 2 values are rendered:
  // Gereken Brüt: 56.703,60 (mocked numberflow: 56703.6)
  await waitFor(() => {
    expect(screen.getByText('Gereken Brüt Maaş (Ocak)')).toBeDefined();
    expect(screen.getByText('56703.6')).toBeDefined();
    expect(screen.getByText('720.514,32')).toBeDefined();
    expect(screen.getByText('56.703,60')).toBeDefined();
    expect(screen.getByText('45.000,00')).toBeDefined();
  });

  // Step 5: Resolve call 1 LATER (out of order response)
  await act(async () => {
    resolveCall1!(mockGrossToNetResponse);
  });

  // Step 6: Verify call 1 response did NOT overwrite the UI!
  expect(screen.getByText('Gereken Brüt Maaş (Ocak)')).toBeDefined();
  expect(screen.queryByText('Ocak Ayı Net Maaş')).toBeNull();
  expect(screen.getByText('56703.6')).toBeDefined();
  expect(screen.queryByText('40207.53')).toBeNull();
  expect(screen.getByText('720.514,32')).toBeDefined();
  expect(screen.queryByText('600.000,00')).toBeNull();
  expect(screen.getByText('56.703,60')).toBeDefined();
  expect(screen.getByText('45.000,00')).toBeDefined();
});

test('Strict regression: Delayed response during discount change in same mode does NOT overwrite new results', async () => {
  let resolveCallA: (val: any) => void;
  const callAPromise = new Promise((resolve) => {
    resolveCallA = resolve;
  });

  let resolveCallB: (val: any) => void;
  const callBPromise = new Promise((resolve) => {
    resolveCallB = resolve;
  });

  // Call A: Delayed initial grossToNet (discount: 'none')
  // Call B: Updated grossToNet (discount: 'manufacturing')
  (calculateAction as any)
    .mockImplementationOnce(() => callAPromise)
    .mockImplementationOnce(() => callBPromise);

  await act(async () => {
    render(<MaasForm calculator={maasCalculatorDef as any} />);
  });

  // Wait for Call A to start
  await waitFor(() => {
    expect(calculateAction).toHaveBeenCalledTimes(1);
    expect(calculateAction).toHaveBeenLastCalledWith(
      'maas',
      expect.objectContaining({ employerDiscountType: 'none' })
    );
  });

  // Change employer discount in same mode
  const discountSelect = screen.getByLabelText(/İşveren SGK İndirimi/i);
  await act(async () => {
    fireEvent.change(discountSelect, { target: { value: 'manufacturing' } });
  });

  // Wait for Call B to start
  await waitFor(() => {
    expect(calculateAction).toHaveBeenCalledTimes(2);
    expect(calculateAction).toHaveBeenLastCalledWith(
      'maas',
      expect.objectContaining({ employerDiscountType: 'manufacturing' })
    );
  });

  // Resolve Call B FIRST (manufacturing: 700.500,00 TL annual cost)
  await act(async () => {
    resolveCallB!(mockManufacturingResponse);
  });

  await waitFor(() => {
    expect(screen.getByText('700.500,00')).toBeDefined();
    expect(screen.getByText('58.375,00')).toBeDefined();
  });

  // Resolve Call A LATER (out of order, none: 738.000,00 TL annual cost)
  await act(async () => {
    resolveCallA!(mockGrossToNetResponse);
  });

  // Assert Call A did NOT overwrite Call B!
  expect(screen.getByText('700.500,00')).toBeDefined();
  expect(screen.queryByText('738.000,00')).toBeNull();
  expect(screen.getByText('58.375,00')).toBeDefined();
});
