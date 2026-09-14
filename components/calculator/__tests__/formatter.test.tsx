import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalculatorFieldComponent } from '../calculator-field';
import { describe, it, expect } from 'vitest';

const TestCurrency = () => {
  const [val, setVal] = useState<any>('');
  return (
    <div>
      <CalculatorFieldComponent
        field={{id: "loanAmount", label: "Kredi Tutar", type: "currency"} as any}
        value={val}
        onChange={setVal}
      />
      <div data-testid="num">{String(val)}</div>
    </div>
  );
};

const TestNumericInteger = () => {
  const [val, setVal] = useState<any>('');
  return (
    <div>
      <CalculatorFieldComponent
        field={{id: "vade", label: "Vade", type: "number", step: 1} as any}
        value={val}
        onChange={setVal}
      />
    </div>
  );
};

const TestText = () => {
  const [val, setVal] = useState<any>('');
  return (
    <div>
      <CalculatorFieldComponent
        field={{id: "iban", label: "IBAN", type: "text"} as any}
        value={val}
        onChange={setVal}
      />
    </div>
  );
};

const TestDate = () => {
  const [val, setVal] = useState<any>('');
  return (
    <div>
      <CalculatorFieldComponent
        field={{id: "birthDate", label: "Dogum Tarihi", type: "date"} as any}
        value={val}
        onChange={setVal}
      />
    </div>
  );
};

describe('FormattedNumberInput - kritik senaryo testi', () => {
  it('DOM type="text" ve inputMode="decimal"', async () => {
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputMode')).toBe('decimal');
  });

  it('1000 → 1.000 görüntüsü, motor 1000 alır', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '1000');
    expect(input.value).toBe('1.000');
    expect(Number(screen.getByTestId('num').textContent)).toBe(1000);
  });

  it('100000 → 100.000', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '100000');
    expect(input.value).toBe('100.000');
    expect(Number(screen.getByTestId('num').textContent)).toBe(100000);
  });

  it('1000000 → 1.000.000', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '1000000');
    expect(input.value).toBe('1.000.000');
    expect(Number(screen.getByTestId('num').textContent)).toBe(1000000);
  });

  it('1000000000 → 1.000.000.000', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '1000000000');
    expect(input.value).toBe('1.000.000.000');
    expect(Number(screen.getByTestId('num').textContent)).toBe(1000000000);
  });

  it('ondalıklı: 125000,50 → 125.000,50 ve motor 125000.5', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '125000,50');
    expect(input.value).toBe('125.000,50');
    expect(Number(screen.getByTestId('num').textContent)).toBe(125000.5);
  });

  it('negatif: -100000 → -100.000', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '-100000');
    expect(input.value).toBe('-100.000');
  });

  it('boş input', async () => {
    const user = userEvent.setup();
    render(<TestCurrency />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, '1000');
    await user.clear(input);
    expect(input.value).toBe('');
    expect(screen.getByTestId('num').textContent).toBe('');
  });
});

describe('InputMode Klavye Davranislari', () => {
  it('A) numeric field (step:1) -> inputMode="numeric"', async () => {
    render(<TestNumericInteger />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputMode')).toBe('numeric');
  });

  it('C1) text alani -> mevcut davranis korunuyor (inputMode yok)', async () => {
    render(<TestText />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputMode')).toBeNull();
  });

  it('C2) date alani -> type="date" ve inputMode yok', async () => {
    render(<TestDate />);
    const input = document.getElementById('field-birthDate') as HTMLInputElement;
    expect(input.type).toBe('date');
    expect(input.getAttribute('inputMode')).toBeNull();
  });
});
