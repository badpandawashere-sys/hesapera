import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import { PerimeterForm } from '@/components/calculator/perimeter-form';

describe('Perimeter Form Integration Test', () => {
  it('should render zero correctly and not lose it on empty string check', () => {
    const { container } = render(<PerimeterForm calculator={{ slug: 'cevre', name: 'Çevre Hesaplama' } as any} />);
    
    // Default shape is "Dikdörtgen". It has 2 inputs: kenarA and kenarB
    const inputs = container.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBe(2);

    const inputA = inputs[0] as HTMLInputElement;

    // input -> 0
    fireEvent.change(inputA, { target: { value: '0' } });
    expect(inputA.value).toBe('0');

    // input -> 10
    fireEvent.change(inputA, { target: { value: '10' } });
    expect(inputA.value).toBe('10');

    // input clear
    fireEvent.change(inputA, { target: { value: '' } });
    expect(inputA.value).toBe('');

    // input -> 0 again
    fireEvent.change(inputA, { target: { value: '0' } });
    expect(inputA.value).toBe('0');

    // Change shape to "Daire"
    const selects = container.querySelectorAll('select');
    const shapeSelect = selects[0] as HTMLSelectElement;
    fireEvent.change(shapeSelect, { target: { value: 'Daire' } });

    // Daire has 1 input: yaricap
    const daireInputs = container.querySelectorAll('input[type="text"]');
    expect(daireInputs.length).toBe(1);
    
    const yaricapInput = daireInputs[0] as HTMLInputElement;
    fireEvent.change(yaricapInput, { target: { value: '0' } });
    expect(yaricapInput.value).toBe('0');
  });
});
