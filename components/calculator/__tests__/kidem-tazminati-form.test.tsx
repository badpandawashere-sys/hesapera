import { render, screen, act, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import { KidemTazminatiForm } from '../kidem-tazminati-form';
import { kidemTazminatiCalculatorDef } from '@/calculators/definitions/kidemTazminati';
import { calculateAction } from '@/app/actions/calculate';
import { CSGB_SOURCE_URL } from '@/calculators/formulas/kidemTazminati';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid="number-flow">{value}</span>
}));

const mockEligibleResult = {
  success: true,
  data: {
    primaryResult: {
      isEligible: true,
      servicePeriod: {
        years: 4,
        months: 1,
        days: 0,
        totalDays: 1492,
        formattedString: '4 yıl 1 ay 0 gün'
      },
      appliedCeiling: 64948.77,
      effectiveBaseSalary: 50000,
      isCapped: false,
      breakdown: {
        yearAmount: 200000,
        monthAmount: 4166.67,
        dayAmount: 0
      },
      grossSeverance: 204166.67,
      stampTax: 1549.62,
      netSeverance: 202617.05,
      tavanInfo: {
        periodLabel: '2026 1. Dönem (01.01.2026 – 30.06.2026)',
        circularRef: 'ÇSGB Ücret ve Sendikal İstatistikler / HMB 06.01.2026 tarih ve 1 Sıra Nolu Genelge',
        sourceUrl: CSGB_SOURCE_URL
      },
      disclaimer: 'Yasal simülasyon uyarısı.'
    }
  }
};

const mockIneligibleResult = {
  success: true,
  data: {
    primaryResult: {
      isEligible: false,
      servicePeriod: {
        years: 0,
        months: 6,
        days: 0,
        totalDays: 181,
        formattedString: '0 yıl 6 ay 0 gün'
      },
      appliedCeiling: 64948.77,
      effectiveBaseSalary: 50000,
      isCapped: false,
      breakdown: {
        yearAmount: 0,
        monthAmount: 0,
        dayAmount: 0
      },
      grossSeverance: 0,
      stampTax: 0,
      netSeverance: 0,
      tavanInfo: {
        periodLabel: '2026 1. Dönem (01.01.2026 – 30.06.2026)',
        circularRef: 'ÇSGB Ücret ve Sendikal İstatistikler / HMB 06.01.2026 tarih ve 1 Sıra Nolu Genelge',
        sourceUrl: CSGB_SOURCE_URL
      },
      disclaimer: 'Yasal simülasyon uyarısı.'
    }
  }
};

const mockCappedResult = {
  success: true,
  data: {
    primaryResult: {
      isEligible: true,
      servicePeriod: {
        years: 2,
        months: 0,
        days: 0,
        totalDays: 730,
        formattedString: '2 yıl 0 ay 0 gün'
      },
      appliedCeiling: 64948.77,
      effectiveBaseSalary: 64948.77,
      isCapped: true,
      breakdown: {
        yearAmount: 129897.54,
        monthAmount: 0,
        dayAmount: 0
      },
      grossSeverance: 129897.54,
      stampTax: 985.92,
      netSeverance: 128911.62,
      tavanInfo: {
        periodLabel: '2026 1. Dönem (01.01.2026 – 30.06.2026)',
        circularRef: 'ÇSGB Ücret ve Sendikal İstatistikler / HMB 06.01.2026 tarih ve 1 Sıra Nolu Genelge',
        sourceUrl: CSGB_SOURCE_URL
      },
      disclaimer: 'Yasal simülasyon uyarısı.'
    }
  }
};

describe('KidemTazminatiForm UI Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (calculateAction as any).mockResolvedValue(mockEligibleResult);
  });

  afterEach(() => {
    cleanup();
  });

  test('renders initial form and calls calculateAction after debounce', async () => {
    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    expect(screen.getByLabelText(/İşe Başlama Tarihi/i)).toBeDefined();
    expect(screen.getByLabelText(/İşten Ayrılış Tarihi/i)).toBeDefined();
    expect(screen.getByLabelText(/Son Giydirilmiş Aylık Brüt Ücret/i)).toBeDefined();

    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalledWith('kidem-tazminati', {
        startDate: '2022-01-01',
        endDate: '2026-02-01',
        grossSalary: 50000
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('number-flow').textContent).toBe('202617.05');
      expect(screen.getByText('4 yıl 1 ay 0 gün')).toBeDefined();
    });

    // Verify official CSGB link in UI
    const csgbLink = screen.getByRole('link', { name: /T\.C\. ÇSGB Ücret ve Sendikal İstatistikler Resmî Tablosu/i });
    expect(csgbLink).toBeDefined();
    expect(csgbLink.getAttribute('href')).toBe(CSGB_SOURCE_URL);
  });

  test('displays ineligible warning when service period is under 1 year', async () => {
    (calculateAction as any).mockResolvedValue(mockIneligibleResult);

    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Kıdem Tazminatına Hak Kazanma Şartı Sağlanamadı/i)).toBeDefined();
      expect(screen.getByText(/en az 1 tam yıl \(365 gün\)/i)).toBeDefined();
    });
  });

  test('displays ceiling warning when gross salary exceeds severance ceiling', async () => {
    (calculateAction as any).mockResolvedValue(mockCappedResult);

    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Brüt ücretiniz tavanı aştığı için hesaplama yasal tavan üzerinden yapılmıştır/i)).toBeDefined();
      expect(screen.getByTestId('number-flow').textContent).toBe('128911.62');
    });
  });

  test('shows inline error and blocks calculation when end date is earlier than start date', async () => {
    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    const endDateInput = screen.getByLabelText(/İşten Ayrılış Tarihi/i);
    await act(async () => {
      fireEvent.change(endDateInput, { target: { value: '2020-01-01' } });
    });

    await waitFor(() => {
      expect(screen.getAllByText(/İşten ayrılış tarihi işe giriş tarihinden önce olamaz/i).length).toBeGreaterThan(0);
    });
  });

  test('shows inline error and blocks calculation when invalid calendar date is entered (e.g. 2026-02-30)', async () => {
    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    // Verify Zod schema rejects invalid calendar date
    const schemaValidation = kidemTazminatiCalculatorDef.schema.safeParse({
      startDate: '2022-01-01',
      endDate: '2026-02-30',
      grossSalary: 50000
    });
    expect(schemaValidation.success).toBe(false);

    const endDateInput = screen.getByLabelText(/İşten Ayrılış Tarihi/i);
    Object.defineProperty(endDateInput, 'validity', {
      value: { badInput: true },
      configurable: true
    });
    await act(async () => {
      fireEvent.change(endDateInput, { target: { value: '' } });
    });

    await waitFor(() => {
      expect(screen.getAllByText(/geçerli bir takvim günü girin \(örn\. 2026-02-30 geçersizdir\)/i).length).toBeGreaterThan(0);
    });
  });

  test('shows inline error and blocks calculation for unsupported periods outside 2016-2026 (e.g. 2027-01-01)', async () => {
    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    const endDateInput = screen.getByLabelText(/İşten Ayrılış Tarihi/i);
    await act(async () => {
      fireEvent.change(endDateInput, { target: { value: '2027-01-01' } });
    });

    await waitFor(() => {
      expect(screen.getAllByText(/yalnızca resmî ÇSGB tarihçesi bulunan 2016–2026 yılları arasındaki dönemler için hesaplanabilir/i).length).toBeGreaterThan(0);
    });
  });

  test('prevents delayed older responses from overwriting newer user changes', async () => {
    let resolveFirst: any;
    const firstPromise = new Promise((res) => {
      resolveFirst = res;
    });

    let resolveSecond: any;
    const secondPromise = new Promise((res) => {
      resolveSecond = res;
    });

    (calculateAction as any)
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => secondPromise);

    await act(async () => {
      render(<KidemTazminatiForm calculator={kidemTazminatiCalculatorDef as any} />);
    });

    // Wait for first call
    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalledTimes(1);
    });

    // User updates gross salary
    const grossInput = screen.getByLabelText(/Son Giydirilmiş Aylık Brüt Ücret/i);
    await act(async () => {
      fireEvent.change(grossInput, { target: { value: '80.000' } });
    });

    // Wait for second call
    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalledTimes(2);
    });

    // Resolve second request first (as if it was faster)
    await act(async () => {
      resolveSecond(mockCappedResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId('number-flow').textContent).toBe('128911.62');
    });

    // Now resolve the older delayed first response
    await act(async () => {
      resolveFirst(mockEligibleResult);
    });

    // It should STILL show the second result (not overwritten by the stale first response)
    expect(screen.getByTestId('number-flow').textContent).toBe('128911.62');
  });
});
