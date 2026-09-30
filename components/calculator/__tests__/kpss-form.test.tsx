import { render, screen, fireEvent, act } from '@testing-library/react';
import { expect, test, vi, beforeEach } from 'vitest';
import { KpssForm } from '../kpss-form';
import { kpssCalculatorDef } from '@/calculators/definitions/kpss';
import { calculateAction } from '@/app/actions/calculate';

vi.mock('@/app/actions/calculate', () => ({
  calculateAction: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('KPSS Form - Initial Render Empty Guard', async () => {
  render(<KpssForm calculator={kpssCalculatorDef} />);
  
  expect(calculateAction).not.toHaveBeenCalled();
  
  expect(screen.getByText('—')).toBeDefined();
  expect(screen.getByText('Doğru ve yanlış sayılarını girerek netlerinizi hesaplayın.')).toBeDefined();
});

test('KPSS Form - Click Hesapla with all 0s', async () => {
  render(<KpssForm calculator={kpssCalculatorDef} />);
  
  const btn = screen.getByRole('button', { name: /Hesapla/i });
  await act(async () => {
    fireEvent.click(btn);
  });
  
  expect(calculateAction).not.toHaveBeenCalled();
  expect(screen.getByText('—')).toBeDefined();
});

test('KPSS Form - Valid input triggers calculate', async () => {
  // @ts-ignore
  calculateAction.mockResolvedValueOnce({
    success: true,
    data: {
      primaryResult: '51.25',
      secondaryResults: {
        'Genel Yetenek Neti': '27.50',
        'Genel Kültür Neti': '23.75',
        'Puan Türü': 'KPSSP3'
      },
      isEligible: true
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
  
  expect(calculateAction).toHaveBeenCalledTimes(1);
  
  const resStr = screen.getByTestId('total-net-display');
  expect(resStr.textContent).toContain('51.25 Net');
});

test('KPSS Form - Clears result on level/type change', async () => {
  // @ts-ignore
  calculateAction.mockResolvedValue({
    success: true,
    data: {
      primaryResult: '51.25',
      secondaryResults: {
        'Puan Türü': 'KPSSP3'
      },
      isEligible: true
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
  
  expect(screen.getByTestId('total-net-display').textContent).toContain('51.25 Net');
  
  const btn = screen.getByRole('button', { name: /Önlisans/i });
  await act(async () => {
    fireEvent.click(btn);
  });
  
  expect(screen.queryByTestId('total-net-display')).toBeNull();
  expect(screen.getByText('—')).toBeDefined();
});
