import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LastikEbatForm } from '../lastik-ebat-form';
import { lastikEbatCalculatorDef } from '../../../calculators/definitions/lastikEbat';
import { calculatorToViewModel } from '../../../calculators/core/calculator-types';

vi.mock('../../../lib/utils/format', () => ({
  formatNumber: (val: number, fractionDigits?: number) => {
    if (isNaN(val) || val === null) return '0';
    return val.toLocaleString('tr-TR', {
      minimumFractionDigits: fractionDigits || 0,
      maximumFractionDigits: fractionDigits || 0
    });
  }
}));

describe('LastikEbatForm Component', () => {
  const calculator = calculatorToViewModel(lastikEbatCalculatorDef);

  it('renders the input fields and result panels', async () => {
    render(<LastikEbatForm calculator={calculator} />);
    
    expect(screen.getByText('Mevcut Lastik')).toBeDefined();
    expect(screen.getByText('Yeni Lastik')).toBeDefined();
    expect(screen.getByText('Gösterge Hızı (km/s)')).toBeDefined();

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);

    expect(screen.getByText('Çap Farkı')).toBeDefined();
    expect(screen.getByText('Hız Karşılaştırması')).toBeDefined();
    expect(screen.getByText('Detaylı Karşılaştırma')).toBeDefined();
  });
});
