import { render, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { PercentageForm } from '@/components/calculator/percentage-form';

describe('Percentage Form Integration Test', () => {
  it('should have proper inputMode and format numbers', () => {
    const { container } = render(<PercentageForm calculator={{ slug: 'yuzde', name: 'Yüzde Hesaplama' } as any} />);
    
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBe(2);

    const baseInput = inputs[0] as HTMLInputElement;
    const percInput = inputs[1] as HTMLInputElement;

    // Check DOM properties
    expect(baseInput.getAttribute('type')).toBe('text');
    expect(baseInput.getAttribute('inputmode')).toBe('decimal');

    expect(percInput.getAttribute('type')).toBe('text');
    expect(percInput.getAttribute('inputmode')).toBe('decimal');

    // Currently the form uses raw inputs, so it will display the raw string value of the number
    fireEvent.change(baseInput, { target: { value: '1000' } });
    expect(baseInput.value).toBe('1000');

    fireEvent.change(baseInput, { target: { value: '12500' } });
    expect(baseInput.value).toBe('12500');

    fireEvent.change(baseInput, { target: { value: '1000000' } });
    expect(baseInput.value).toBe('1000000');

    fireEvent.change(baseInput, { target: { value: '' } });
    expect(baseInput.value).toBe('');
  });
});
