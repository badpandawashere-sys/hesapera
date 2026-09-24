import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { KomisyonForm } from '../komisyon-form';
import { komisyonCalculatorDef } from '@/calculators/definitions/komisyon';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      primaryResult: {
        commissionAmount: 100,
        netAmount: 900,
        commissionRate: 10,
        grossAmount: 1000
      }
    }
  })
}));

// Mock NumberFlow for JSDOM compatibility
vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span>{value}</span>
}));

describe('KomisyonForm Component', () => {
  it('renders the initial state without crashing (regression)', async () => {
    // Initial render without state updates wrapped in act
    await act(async () => {
      render(<KomisyonForm calculator={komisyonCalculatorDef as any} />);
    });
    
    // Ensure the page renders blank screen correctly (no blank screen)
    expect(screen.getByText('Komisyon Hesapla')).toBeDefined();
    expect(screen.getByText('Netten Satış Fiyatı')).toBeDefined();
    expect(screen.getByText('Oranı Bul')).toBeDefined();
    expect(screen.getAllByText('Satış Tutarı')).toBeDefined();
    expect(screen.getAllByText('Komisyon Oranı')).toBeDefined();
  });
});
