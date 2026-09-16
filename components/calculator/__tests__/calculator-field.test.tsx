import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, describe, it } from 'vitest';
import { CalculatorFieldComponent } from '../calculator-field';
import { CalculatorField } from '@/calculators/core/calculator-types';

// Helper to wrap the controlled component
function ControlledField({ field }: { field: CalculatorField }) {
  const [value, setValue] = useState<any>('');
  return (
    <CalculatorFieldComponent
      field={field}
      value={value}
      onChange={setValue}
    />
  );
}

describe('CalculatorFieldComponent - FormattedNumberInput Regression', () => {
  const defaultField: CalculatorField = {
    id: 'testField',
    label: 'Test Alanı',
    type: 'number',
    required: true,
  };

  it('A) Typing sequence: 0 -> 0, -> 0,1 -> 0,12', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '0');
    expect(input.value).toBe('0');

    await user.type(input, ',');
    expect(input.value).toBe('0,');

    await user.type(input, '1');
    expect(input.value).toBe('0,1');

    await user.type(input, '2');
    expect(input.value).toBe('0,12');
  });

  it('B) Leading comma behavior: , -> 0, -> ,1 -> 0,1', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, ',');
    expect(input.value).toBe('0,');

    await user.type(input, '1');
    expect(input.value).toBe('0,1');
    
    await user.type(input, '2');
    expect(input.value).toBe('0,12');
  });

  it('C) Typing dot as comma: 0.12 -> 0,12', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '0.12');
    expect(input.value).toBe('0,12');
  });

  it('D) Paste English format: 1234.56 -> 1.234,56', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.click(input);
    await user.paste('1234.56');
    expect(input.value).toBe('1.234,56');
  });

  it('E) Paste Turkish format: 1.234,56 -> 1.234,56', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.click(input);
    await user.paste('1.234,56');
    expect(input.value).toBe('1.234,56');
  });

  it('F) Typing 0,01 sequence', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '0,01');
    expect(input.value).toBe('0,01');
  });

  it('G) Integer field inputMode="numeric"', () => {
    const intField: CalculatorField = {
      ...defaultField,
      step: 1
    };
    render(<ControlledField field={intField} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.getAttribute('inputMode')).toBe('numeric');
  });

  it('H) Decimal field inputMode="decimal"', () => {
    const decField: CalculatorField = {
      ...defaultField,
      step: 0.1
    };
    render(<ControlledField field={decField} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.getAttribute('inputMode')).toBe('decimal');
  });

  it('I) Backspace sequence: 0,12 -> 0,1 -> 0, -> 0', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '0,12');
    expect(input.value).toBe('0,12');

    await user.keyboard('{Backspace}');
    expect(input.value).toBe('0,1');

    await user.keyboard('{Backspace}');
    expect(input.value).toBe('0,');

    await user.keyboard('{Backspace}');
    expect(input.value).toBe('0');
  });

  it('J) Invalid character block', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '1a2b3c,4d');
    expect(input.value).toBe('123,4');
  });
  
  it('K) Blur normalization: 0,1200 -> 0,12', async () => {
    render(<ControlledField field={defaultField} />);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.type(input, '0,1200');
    expect(input.value).toBe('0,1200');
    
    await user.click(document.body);
    expect(input.value).toBe('0,12');
  });
});
