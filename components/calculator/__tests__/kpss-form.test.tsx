import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { KpssForm } from '../kpss-form';
import { kpssCalculatorDef } from '@/calculators/definitions/kpss';
import { calculateAction } from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

vi.mock('@number-flow/react', () => ({
  default: ({ value }: { value: number }) => <span data-testid="number-flow">{value}</span>
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('KPSS Form - Initial Render Empty Guard', async () => {
  render(<KpssForm calculator={kpssCalculatorDef} />);
  
  // Guard should prevent auto-calculation
  expect(calculateAction).not.toHaveBeenCalled();
  
  // Empty state should be visible
  expect(screen.getByText('—')).toBeDefined();
  expect(screen.getByText('Doğru ve yanlış sayılarını girerek tahmini puanınızı hesaplayın.')).toBeDefined();
});

test('KPSS Form - Click Hesapla with all 0s', async () => {
  render(<KpssForm calculator={kpssCalculatorDef} />);
  
  const btn = screen.getByRole('button', { name: /Hesapla/i });
  await act(async () => {
    fireEvent.click(btn);
  });
  
  // Still 0s, should not call calculateAction
  expect(calculateAction).not.toHaveBeenCalled();
  expect(screen.getByText('—')).toBeDefined();
});

test('KPSS Form - Valid input triggers calculate', async () => {
  // @ts-ignore
  calculateAction.mockResolvedValueOnce({
    success: true,
    data: {
      primaryResult: '85,420',
      secondaryResults: {
        'Genel Yetenek Neti': '25.00',
        'Genel Kültür Neti': '20.00'
      }
    }
  });

  render(<KpssForm calculator={kpssCalculatorDef} />);
  
  // Fill inputs by clicking + button or just testing the action
  // The structure uses Plus/Minus buttons in a custom stepper
  // Let's just find the first input and change it if we can.
  // Actually, we can click the "+" button for GY Doğru
  const plusBtns = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-plus'));
  
  // Click first Plus (GY correct)
  await act(async () => {
    fireEvent.click(plusBtns[0]);
  });
  
  const calcBtn = screen.getByRole('button', { name: /Hesapla/i });
  await act(async () => {
    fireEvent.click(calcBtn);
  });
  
  expect(calculateAction).toHaveBeenCalledTimes(1);
  
  // Result should be rendered
  expect(screen.getByTestId('number-flow').textContent).toBe('85.42');
});

test('KPSS Form - Clears result on level/type change', async () => {
  // @ts-ignore
  calculateAction.mockResolvedValue({
    success: true,
    data: {
      primaryResult: '85,420'
    }
  });

  render(<KpssForm calculator={kpssCalculatorDef} />);
  
  const plusBtns = screen.getAllByRole('button').filter(b => b.innerHTML.includes('lucide-plus'));
  await act(async () => {
    fireEvent.click(plusBtns[0]);
  });
  
  const calcBtn = screen.getByRole('button', { name: /Hesapla/i });
  await act(async () => {
    fireEvent.click(calcBtn);
  });
  
  expect(screen.getByTestId('number-flow').textContent).toBe('85.42');
  
  // Now change level
  const btn = screen.getByRole('button', { name: /Önlisans/i });
  await act(async () => {
    fireEvent.click(btn);
  });
  
  // Result should be cleared
  expect(screen.queryByTestId('number-flow')).toBeNull();
  expect(screen.getByText('—')).toBeDefined();
});
