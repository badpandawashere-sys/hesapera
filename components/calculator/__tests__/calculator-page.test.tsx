import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorForm } from '../calculator-form';
import { CalculatorRegistry } from '@/calculators/core/calculator-registry';
import { calculatorToViewModel } from '@/calculators/core/calculator-types';
import { initializeCalculators } from '@/calculators/core/init';

// Mock the server action
vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

import { calculateAction } from '@/app/actions/calculate';

describe('Dynamic Calculator Page UI', () => {
  beforeEach(() => {
    initializeCalculators();
    vi.clearAllMocks();
  });

  it('1. should render form with correct fields from definition', () => {
    const calc = CalculatorRegistry.getBySlug('yuzde')!;
    render(<CalculatorForm calculator={calculatorToViewModel(calc)} />);

    expect(screen.getByLabelText(/Sayı/i)).toBeDefined();
    expect(screen.getByLabelText(/Yüzde Oranı/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Hesapla/i })).toBeDefined();
  });

  it('2. should show validation errors when submitted empty', async () => {
    const calc = CalculatorRegistry.getBySlug('yuzde')!;
    
    // Engine mock simulating validation failure
    (calculateAction as any).mockResolvedValueOnce({
      success: false,
      errors: ['baseValue: Required', 'percentage: Required']
    });

    render(<CalculatorForm calculator={calculatorToViewModel(calc)} />);
    
    const submitBtn = screen.getByRole('button', { name: /Hesapla/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(calculateAction).toHaveBeenCalledWith('yuzde', {});
      // The component should map "baseValue: Required" to the baseValue field and show the text
      expect(screen.getAllByText('Required').length).toBe(2);
    });
  });

  it('3. should calculate valid input and display result successfully', async () => {
    const calc = CalculatorRegistry.getBySlug('yuzde')!;
    
    (calculateAction as any).mockResolvedValueOnce({
      success: true,
      data: {
        primaryResult: 200,
      },
      notes: ['Calculation successful']
    });

    render(<CalculatorForm calculator={calculatorToViewModel(calc)} />);
    
    const user = userEvent.setup();
    const baseInput = screen.getByLabelText(/Sayı/i);
    const percentInput = screen.getByLabelText(/Yüzde Oranı/i);
    const submitBtn = screen.getByRole('button', { name: /Hesapla/i });

    fireEvent.change(baseInput, { target: { value: '1000' } });
    fireEvent.change(percentInput, { target: { value: '20' } });
    
    fireEvent.click(submitBtn);

    // Let React update
    await waitFor(() => {
      expect(screen.getByText('200')).toBeDefined();
      expect(screen.getByText('Calculation successful')).toBeDefined();
    });
  });
});
