import { render, screen } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { KomisyonForm } from '../komisyon-form';
import { komisyonCalculatorDef } from '@/calculators/definitions/komisyon';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      raw: {
        commissionAmount: 100,
        netAmount: 900,
        commissionRate: 10,
        grossAmount: 1000
      }
    }
  })
}));

describe('KomisyonForm Component', () => {
  it('renders the title and buttons', () => {
    render(<KomisyonForm calculator={komisyonCalculatorDef} />);
    
    expect(screen.getByText('Komisyon Hesapla')).toBeDefined();
    expect(screen.getByText('Netten Satış Fiyatı')).toBeDefined();
    expect(screen.getByText('Oranı Bul')).toBeDefined();
    expect(screen.getAllByText('Satış Tutarı')).toBeDefined();
    expect(screen.getAllByText('Komisyon Oranı')).toBeDefined();
  });
});
