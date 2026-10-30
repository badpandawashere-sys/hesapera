import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import CalculatorPage, { generateMetadata } from '@/app/hesaplama/[slug]/page';
import { initializeCalculators } from '@/calculators/core/init';

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

describe('Kredi Dosya Masrafı Page Integration', () => {
  beforeAll(() => {
    initializeCalculators();
  });

  it('generates correct metadata for kredi-dosya-masrafi', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'kredi-dosya-masrafi' }),
    });

    expect(meta.title).toContain('Kredi Dosya Masrafı');
    expect(meta.alternates?.canonical).toBe('https://www.hesapera.com.tr/hesaplama/kredi-dosya-masrafi');
  });

  it('renders CalculatorPage with LoanFeeForm and FAQs for kredi-dosya-masrafi', async () => {
    const PageJsx = await CalculatorPage({
      params: Promise.resolve({ slug: 'kredi-dosya-masrafi' }),
    });

    render(PageJsx);

    expect(screen.getByRole('heading', { level: 1, name: /Kredi Dosya Masrafı/i })).toBeDefined();
    expect(screen.getByText('İhtiyaç Kredisi')).toBeDefined();
    expect(screen.getByText('Konut Kredisi')).toBeDefined();
    expect(screen.getByText('Sıkça Sorulan Sorular')).toBeDefined();
    expect(screen.getByText(/TCMB’nin 2020\/7 sayılı/i)).toBeDefined();
  });
});
