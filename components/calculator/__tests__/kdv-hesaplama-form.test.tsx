import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { KdvHesaplamaForm } from '../kdv-hesaplama-form';
import { CalculatorViewModel } from '@/calculators/core/calculator-types';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn().mockResolvedValue({
    success: true,
    data: {
      primaryResult: 1200,
      secondaryResults: {
        'KDV Hariç Tutar': 1000,
        'KDV Tutarı': 200,
        'KDV Dahil Tutar': 1200,
        'KDV Oranı': '%20'
      }
    }
  })
}));

const mockCalculator: CalculatorViewModel = {
  id: 'calc_kdv_001',
  slug: 'kdv-hesaplama',
  name: 'KDV Hesaplama',
  shortDescription: 'KDV hesaplama test.',
  category: 'finance',
  type: 'simple',
  metadata: { title: 'Test', description: 'Test' },
  fields: []
};

describe('KdvHesaplamaForm Component', () => {
  it('renders correctly with default values', () => {
    render(<KdvHesaplamaForm calculator={mockCalculator} />);
    expect(screen.getByText('KDV HESAPLAMA')).toBeDefined();
    
    // Default value check
    const inputs = screen.getAllByRole('textbox');
    expect((inputs[0] as HTMLInputElement).value).toBe('1.000,00');
    expect(inputs[0].getAttribute('inputmode')).toBe('decimal');
  });

  it('switches mode when buttons clicked', async () => {
    render(<KdvHesaplamaForm calculator={mockCalculator} />);
    
    const cikarBtn = screen.getByText('KDV Çıkar');
    
    act(() => {
      fireEvent.click(cikarBtn);
    });
    
    expect(screen.getByText('KDV Dahil Tutar', { selector: 'label' })).toBeDefined();
  });
});
