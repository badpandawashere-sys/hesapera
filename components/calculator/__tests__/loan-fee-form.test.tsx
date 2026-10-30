import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoanFeeForm } from '../loan-fee-form';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid="number-flow">{value}</span>,
}));

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      primaryResult: '575,00 TL',
      secondaryResults: {},
    },
  }),
}));

const mockCalculator: CalculatorViewModel = {
  id: 'calc_loanFee_001',
  slug: 'kredi-dosya-masrafi',
  name: 'Kredi Dosya Masrafı Hesaplama',
  shortDescription: 'Dosya masrafı hesaplama aracı.',
  category: 'finance',
  type: 'complex',
  metadata: {
    title: 'Kredi Dosya Masrafı Hesaplama',
    description: 'Test',
  },
  fields: [],
};

describe('LoanFeeForm Component', () => {
  it('renders correctly with default values (100.000 TL, %0.50 rate, İhtiyaç)', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    // Segment options
    expect(screen.getByText('İhtiyaç Kredisi')).toBeDefined();
    expect(screen.getByText('Konut Kredisi')).toBeDefined();
    expect(screen.getByText('Taşıt Kredisi')).toBeDefined();
    expect(screen.getByText('Ticari Kredi')).toBeDefined();

    // Default amount input
    const inputs = screen.getAllByRole('textbox');
    expect((inputs[0] as HTMLInputElement).value).toBe('100.000');

    // Hero title
    expect(screen.getAllByText(/Toplam Kredi Masrafı/i).length).toBeGreaterThan(0);
    // Net amount title
    expect(screen.getByText(/Elinize Geçecek Net Tutar/i)).toBeDefined();
    // Default BSMV badge
    expect(screen.getByText('%15 BSMV')).toBeDefined();
  });

  it('handles Konut Kredisi 7491 SK question (BSMV exempt vs non-exempt)', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const konutBtn = screen.getByText('Konut Kredisi');
    act(() => {
      fireEvent.click(konutBtn);
    });

    // 7491 SK question must appear
    expect(screen.getByText(/Konut BSMV İstisnası Denetimi/i)).toBeDefined();
    expect(screen.getByText(/Hayır \(İlk Evim\)/i)).toBeDefined();
    expect(screen.getByText('BSMV Muaf')).toBeDefined();
    expect(screen.getByText('0,00 TL (%0 İstisna)')).toBeDefined();

    // Now select "Evet (Kayıtlı Konut Var)"
    const evetBtn = screen.getByText(/Evet \(Kayıtlı Konut Var\)/i);
    act(() => {
      fireEvent.click(evetBtn);
    });

    expect(screen.getAllByText(/%15 BSMV \(7491 SK\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/7491 sayılı Kanun m\. 6 uyarınca üzerine kayıtlı konutu olan/i)).toBeDefined();
  });

  it('renders TCMB 2020/4 Madde 9 commercial loan fee fields when Ticari Kredi is selected', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const ticariBtn = screen.getByText('Ticari Kredi');
    act(() => {
      fireEvent.click(ticariBtn);
    });

    expect(screen.getByText(/Ticari Kredi Ücretleri \(TCMB 2020\/4 Tebliği Madde 9\)/i)).toBeDefined();
    expect(screen.getAllByText(/Limit Tahsis Ücreti/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Kredi Kullandırım Ücreti/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/%5 BSMV/).length).toBeGreaterThan(0);

    // Verify misleading "%1,30 toplam yasal tavan" is NOT present
    expect(screen.queryByText(/%1,30/)).toBeNull();
    expect(screen.queryByText(/toplam yasal tavan/i)).toBeNull();
  });

  it('updates usage fee ceiling when 180-day commercial loan term is selected (%0.55)', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const ticariBtn = screen.getByText('Ticari Kredi');
    act(() => {
      fireEvent.click(ticariBtn);
    });

    // Select 180 Gün chip
    const oneEightyDaysBtn = screen.getByText('180 Gün');
    act(() => {
      fireEvent.click(oneEightyDaysBtn);
    });

    expect(screen.getByText(/Azami Tavan %0\.55/i)).toBeDefined();
  });

  it('updates limit allocation fee ceiling when 6-month limit duration is selected (%0.10)', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const ticariBtn = screen.getByText('Ticari Kredi');
    act(() => {
      fireEvent.click(ticariBtn);
    });

    // Select 6 Ay button in Limit Tahsis Süresi
    const limitDurationBtns = screen.getAllByRole('button', { name: /6 Ay/i });
    act(() => {
      fireEvent.click(limitDurationBtns[0]);
    });

    expect(screen.getAllByText(/Tavan: %0\.10/i).length).toBeGreaterThan(0);
  });

  it('displays rotatif average balance input when Rotatif TL is selected', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const ticariBtn = screen.getByText('Ticari Kredi');
    act(() => {
      fireEvent.click(ticariBtn);
    });

    const rotatifBtn = screen.getByText(/Rotatif \(BCH\) TL/i);
    act(() => {
      fireEvent.click(rotatifBtn);
    });

    expect(screen.getByText(/Dönem Ortalama Kredi Kullandırım Bakiyesi/i)).toBeDefined();
  });

  it('displays free pricing notice when Döviz Cinsi Kredi is selected', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const ticariBtn = screen.getByText('Ticari Kredi');
    act(() => {
      fireEvent.click(ticariBtn);
    });

    const dovizBtn = screen.getByText(/Döviz Cinsi Kredi/i);
    act(() => {
      fireEvent.click(dovizBtn);
    });

    expect(screen.getAllByText(/Serbest Oran/i).length).toBeGreaterThan(0);
  });

  it('supports changing Deduction Mode (Krediden Kesilen vs Ayrıca Ödenen)', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const ayricaBtn = screen.getByText('Tümü Ayrıca Ödensin');
    act(() => {
      fireEvent.click(ayricaBtn);
    });

    expect(screen.getByText('Kesintisiz Net Tutar')).toBeDefined();
  });

  it('toggles 3rd party expenses accordion', () => {
    render(<LoanFeeForm calculator={mockCalculator} />);

    const accordionBtn = screen.getByText('Üçüncü Taraf Belgelenmiş Masraflar (Opsiyonel)');
    act(() => {
      fireEvent.click(accordionBtn);
    });

    expect(screen.getByText(/Hayat Sigortası Primi/i)).toBeDefined();
  });
});
